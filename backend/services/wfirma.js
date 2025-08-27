// backend/services/wfirma.js
const axios = require("axios");

const {
  WFIRMA_ACCESS_KEY,
  WFIRMA_SECRET_KEY,
  WFIRMA_COMPANY_ID,
  WFIRMA_SERIES,
  WFIRMA_MODE, // 'proforma' | 'normal'
  WFIRMA_SHIPPING_VAT,
} = process.env;

// (opcjonalnie) log braków ENV przy starcie
if (!WFIRMA_ACCESS_KEY || !WFIRMA_SECRET_KEY || !WFIRMA_COMPANY_ID) {
  console.error("[wFirma] Brak ENV", {
    hasAccess: !!WFIRMA_ACCESS_KEY,
    hasSecret: !!WFIRMA_SECRET_KEY,
    companyId: WFIRMA_COMPANY_ID,
  });
}

// --- klient axios ---
const api = axios.create({
  baseURL: "https://api2.wfirma.pl",
  timeout: 15000,
  headers: {
    "Content-Type": "application/xml; charset=utf-8",
    "User-Agent": "wedlinka-app/1.0",
  },
  params: {
    company_id: WFIRMA_COMPANY_ID,
    inputFormat: "xml",
    outputFormat: "json", // <- kluczowe
  },
  auth: {
    username: WFIRMA_ACCESS_KEY,
    password: WFIRMA_SECRET_KEY,
  },
});

// pokaż surowe błędy z wFirma (ułatwia diagnostykę)
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const st = err.response?.status;
    const body = err.response?.data;
    console.error(
      "[wFirma error]",
      st,
      typeof body === "string" ? body.slice(0, 1000) : body
    );
    return Promise.reject(err);
  }
);

// --- helpers ---
function normErr(e) {
  if (e.response)
    return new Error(`[wFirma ${e.response.status}] ${e.response.statusText}`);
  return new Error(`[wFirma] ${e.message}`);
}

// wFirma w JSON potrafi zwrócić: { group: { "0": {singular:{...}}, "1": {...} } }
// albo { group: { singular: {...} } } albo { group: [ {singular:{...}} ] }
function pickFirstEntity(root, groupKey, singularKey) {
  const grp = root?.[groupKey];
  if (!grp) return null;

  // 1) jeśli jest bezpośrednio { group: { singular: {...} } }
  if (grp[singularKey]) return grp[singularKey];

  // 2) jeśli jest tablica
  if (Array.isArray(grp)) {
    const first = grp[0];
    return first?.[singularKey] || first;
  }

  // 3) jeśli jest obiekt z kluczami numerycznymi
  const values = Object.values(grp);
  if (values.length) {
    const first = values[0];
    return first?.[singularKey] || first;
  }

  return null;
}

// --- NORMALIZACJE DANYCH DLA WFIRMA ---
const normZip = (s = "") =>
  String(s)
    .replace(/\s+/g, "")
    .replace(/^(\d{2})[- ]?(\d{3})$/, "$1-$2");
const normNip = (s = "") => String(s).replace(/\D+/g, "");

// ——— ujednolicenie odpowiedzi ———
function rootApi(data) {
  // wFirma czasem zwraca { api: {...} }, a czasem już „gołe” drzewo
  return data?.api ? data.api : data;
}

// rekurencyjnie zbiera błędy walidacyjne z dowolnego miejsca odpowiedzi
function collectErrors(data) {
  const out = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (node.errors?.error) {
      const arr = Array.isArray(node.errors.error)
        ? node.errors.error
        : [node.errors.error];
      for (const e of arr) {
        const field = e?.field ? `${e.field}: ` : "";
        const msg = e?.message || "";
        if (field || msg) out.push((field + msg).trim());
      }
    }
    for (const v of Object.values(node)) {
      if (v && typeof v === "object") walk(v);
    }
  };
  walk(rootApi(data));
  return out;
}

function ensureOkOrThrow(data, what = "Operacja") {
  const root = rootApi(data);
  const code = root?.status?.code;
  if (code === "OK") return;

  const errs = collectErrors(data);
  const msg = errs.length ? errs.join("; ") : `status: ${code || "UNKNOWN"}`;
  throw new Error(`${what} nie powiodła się – ${msg}`);
}

function escapeXml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
function to2(n) {
  return (Math.round(Number(n) * 100) / 100).toFixed(2);
}
function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// --- kontrahent: najpierw ADD, jeśli błąd (np. duplikat) -> FIND różnymi polami ---
async function upsertContractor(billing) {
  if (!billing?.name) throw new Error("Brak nazwy kontrahenta (name)");
  if (!billing?.street || !billing?.city || !billing?.zip) {
    throw new Error("Brak adresu kontrahenta (street/city/zip)");
  }

  // helper: wyślij find z warunkiem field=..., op=eq, value=...
  const tryFind = async (field, value) => {
    const findXml = `
      <contractors>
        <parameters>
          <conditions>
            <condition>
              <field>${field}</field>
              <operator>eq</operator>
              <value>${escapeXml(value)}</value>
            </condition>
          </conditions>
          <limit>1</limit>
        </parameters>
      </contractors>`;
    try {
      const resp = await api.post("/contractors/find", findXml);
      // UWAGA: wFirma często zwraca NOT FOUND/ERROR przy braku – potraktujmy to jako "brak trafienia"
      if (resp.data?.status?.code !== "OK") return null;
      const ent = pickFirstEntity(resp.data, "contractors", "contractor");
      return ent?.id ? String(ent.id) : null;
    } catch {
      return null; // jakiekolwiek 4xx/5xx – traktuj jako brak
    }
  };

  // normalizacja
  billing.zip = normZip(billing.zip || "");
  if (billing.nip) billing.nip = normNip(billing.nip);
  if (!billing.country) billing.country = "Polska"; // NIE "PL"

  console.log("[wFirma contractors/add INPUT]", {
    name: billing.name,
    nip: billing.nip || null,
    email: billing.email || null,
    street: billing.street,
    city: billing.city,
    zip: billing.zip,
    country: billing.country,
  });

  const addXml = `
  <contractors>
    <contractor>
      <name>${escapeXml(billing.name)}</name>
      ${billing.nip ? `<nip>${escapeXml(billing.nip)}</nip>` : ""}
      ${billing.email ? `<email>${escapeXml(billing.email)}</email>` : ""}
      <street>${escapeXml(billing.street)}</street>
      <city>${escapeXml(billing.city)}</city>
      <zip>${escapeXml(billing.zip)}</zip>
      <country>${escapeXml(billing.country)}</country>
    </contractor>
  </contractors>`;

  try {
    const res = await api.post("/contractors/add", addXml);
    ensureOkOrThrow(res.data, "Dodawanie kontrahenta");
    const ent = pickFirstEntity(res.data, "contractors", "contractor");
    const id = ent?.id;
    if (!id) {
      console.error(
        "[wFirma contractors/add] Odpowiedź bez id:",
        JSON.stringify(res.data, null, 2)
      );
      throw new Error("Brak ID kontrahenta w odpowiedzi");
    }
    return String(id);
  } catch (addErr) {
    // pokaż surowe body z wFirma (na czas diagnozy)
    const body = addErr?.response?.data;
    if (body) {
      console.error(
        "[wFirma contractors/add RAW]",
        JSON.stringify(body, null, 2)
      );
      try {
        ensureOkOrThrow(body, "Dodawanie kontrahenta");
      } catch (detailed) {
        // to już zbiera standardowe 'errors -> error -> field/message'
        throw new Error(`[wFirma] ${detailed.message}`);
      }
      // jeśli ensureOkOrThrow nie rzuciło (nietypowa struktura) – wywal surowe body
      throw new Error(
        `[wFirma] Dodawanie kontrahenta nie powiodło się – RAW: ${JSON.stringify(
          body
        )}`
      );
    }
    throw normErr(addErr);
  }
}

// --- dokument: proforma/normal ---
async function createDocument({ contractorId, order }) {
  const series = WFIRMA_SERIES;
  const isProforma = (WFIRMA_MODE || "proforma") === "proforma";

  const itemsXml = order.items
    .map(
      (it) => `
    <invoicecontent>
      <name>${escapeXml(it.name)}</name>
      <count>${it.qty}</count>
      <unit>${escapeXml(it.unit || "szt")}</unit>
      <price_brutto>${to2(it.priceBrut)}</price_brutto>
      <vat>${escapeXml(it.vatRate || "23")}</vat>
    </invoicecontent>
  `
    )
    .join("");

  const shippingXml = order.shippingCost
    ? `
    <invoicecontent>
      <name>Koszt dostawy</name>
      <count>1</count>
      <unit>szt</unit>
      <price_brutto>${to2(order.shippingCost)}</price_brutto>
      <vat>${escapeXml(
        order.shippingVatRate || WFIRMA_SHIPPING_VAT || "23"
      )}</vat>
    </invoicecontent>
  `
    : "";

  const xml = `
    <invoices>
      <invoice>
        <contractor_id>${contractorId}</contractor_id>
        <series>${escapeXml(series)}</series>
        ${isProforma ? `<kind>proforma</kind>` : `<kind>normal</kind>`}
        <payment_kind>${escapeXml(
          order.isPaid ? "zapłacono" : "przelew"
        )}</payment_kind>
        <issue_date>${order.issueDate || today()}</issue_date>
        <sale_date>${order.saleDate || today()}</sale_date>
        <invoicecontents>
          ${itemsXml}
          ${shippingXml}
        </invoicecontents>
      </invoice>
    </invoices>
  `;

  try {
    const res = await api.post("/invoices/add", xml);
    ensureOkOrThrow(res.data, "Tworzenie dokumentu");
    const ent = pickFirstEntity(res.data, "invoices", "invoice");
    const id = ent?.id;
    const number = ent?.fullnumber;
    if (!id) {
      console.error(
        "[wFirma invoices/add] Odpowiedź bez id:",
        JSON.stringify(res.data, null, 2)
      );
      throw new Error("Brak ID faktury w odpowiedzi");
    }
    return { id: String(id), number: String(number || "") };
  } catch (e) {
    throw normErr(e);
  }
}

// --- PDF ---
async function getDocumentPdf(invoiceId) {
  try {
    const xml = `<invoices><parameters><invoice_id>${invoiceId}</invoice_id></parameters></invoices>`;
    const res = await api.post("/invoices/download", xml, {
      responseType: "arraybuffer",
      headers: { Accept: "application/pdf" },
    });
    return Buffer.from(res.data);
  } catch (e) {
    throw normErr(e);
  }
}

module.exports = { upsertContractor, createDocument, getDocumentPdf };
