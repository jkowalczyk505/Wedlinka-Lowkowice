// backend/services/wfirma.js
const axios = require("axios");

const {
  WFIRMA_ACCESS_KEY,
  WFIRMA_SECRET_KEY,
  WFIRMA_APP_KEY, // <— NOWE
  WFIRMA_COMPANY_ID,
  WFIRMA_SERIES,
  WFIRMA_SERIES_ID, // <- NOWE: ID serii
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
    // API Key auth — 3 nagłówki wymagane przez wFirmę
    accessKey: WFIRMA_ACCESS_KEY,
    secretKey: WFIRMA_SECRET_KEY,
    appKey: WFIRMA_APP_KEY,
  },
  params: {
    company_id: WFIRMA_COMPANY_ID,
    inputFormat: "xml",
    outputFormat: "json", // <- kluczowe
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

// NIP – usuń znaki niecyfrowe + sprawdź sumę kontrolną
const cleanNip = (s = "") => String(s).replace(/\D+/g, "");
function isValidNip(nip) {
  const w = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  if (!/^\d{10}$/.test(nip)) return false;
  const sum = w.reduce((acc, wv, i) => acc + wv * Number(nip[i]), 0);
  return sum % 11 === Number(nip[9]);
}

// --- helpers (dopisz obok innych) ---
function toWfirmaVat(value) {
  if (value == null) return "23"; // fallback
  const s = String(value).trim().toLowerCase();

  // obsługa kodów specjalnych (gdybyś kiedyś używał)
  if (s === "zw" || s === "np" || s === "oo") return s;

  const n = Number(s.replace(",", ".")); // akceptuj "5", "0.05", "5,0"
  if (Number.isFinite(n)) {
    if (n > 1) return String(Math.round(n)); // "5" -> "5", "8" -> "8"
    if (n >= 0) return String(Math.round(n * 100)); // "0.05" -> "5"
  }
  return "23"; // ostatni fallback
}

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
  const rawHint = (() => {
    try {
      return " | raw=" + JSON.stringify(root).slice(0, 300);
    } catch {
      return "";
    }
  })();
  const msg =
    (errs.length ? errs.join("; ") : `status: ${code || "UNKNOWN"}`) + rawHint;
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

// --- SERIE: ustal ID serii po ENV lub po nazwie ---
let cachedSeriesId = null;

async function getSeriesId() {
  if (cachedSeriesId) return cachedSeriesId;
  if (WFIRMA_SERIES_ID) {
    cachedSeriesId = String(WFIRMA_SERIES_ID);
    return cachedSeriesId;
  }
  if (!WFIRMA_SERIES) return null;

  const seriesType =
    String(process.env.WFIRMA_MODE || "proforma").toLowerCase() === "normal"
      ? "normal"
      : "proforma";

  // Szukamy serii po nazwie (i typie proforma – żeby trafić właściwą)
  const findXml = `
    <api>
      <series>
        <parameters>
          <conditions>
            <condition>
              <field>name</field>
              <operator>eq</operator>
              <value>${escapeXml(WFIRMA_SERIES)}</value>
            </condition>
            <condition>
              <field>type</field>
              <operator>eq</operator>
              <value>${seriesType}</value>
            </condition>
          </conditions>
          <limit>1</limit>
        </parameters>
      </series>
    </api>`;
  const res = await api.post("/series/find", findXml);
  ensureOkOrThrow(res.data, "Pobieranie serii");
  const ent = pickFirstEntity(
    res.data.api ? res.data.api : res.data,
    "series",
    "series"
  );
  const id = ent?.id;
  if (!id) return null;
  cachedSeriesId = String(id);
  return cachedSeriesId;
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
    <api>
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
      </contractors>
    </api>`;
    try {
      const resp = await api.post("/contractors/find", findXml);
      if ((resp.data?.status?.code || resp.data?.api?.status?.code) !== "OK")
        return null;
      const ent = pickFirstEntity(
        resp.data.api ? resp.data.api : resp.data,
        "contractors",
        "contractor"
      );
      return ent?.id ? String(ent.id) : null;
    } catch {
      return null;
    }
  };

  // normalizacja
  billing.zip = normZip(billing.zip || "");
  let nip = billing.nip ? cleanNip(billing.nip) : null;
  // jeśli NIP podany, ale nieprawidłowy – NIE wysyłamy go do wFirma
  if (nip && !isValidNip(nip)) nip = null;
  billing.nip = nip;

  // wFirma oczekuje kodu kraju – użyjemy "PL"
  billing.country = "PL";

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
  <api>
    <contractors>
      <contractor>
        <name>${escapeXml(billing.name)}</name>
        ${
          billing.nip
            ? `<tax_id_type>nip</tax_id_type>`
            : `<tax_id_type>none</tax_id_type>`
        }
        ${billing.nip ? `<nip>${escapeXml(billing.nip)}</nip>` : ""}
        ${billing.email ? `<email>${escapeXml(billing.email)}</email>` : ""}
        <street>${escapeXml(billing.street)}</street>
        <city>${escapeXml(billing.city)}</city>
        <zip>${escapeXml(billing.zip)}</zip>
        <country>${escapeXml(billing.country)}</country>
      </contractor>
    </contractors>
  </api>`;

  console.log("[wFirma contractors/add XML] =>\n", addXml);

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
    const body = addErr?.response?.data;
    if (body) {
      console.error(
        "[wFirma contractors/add RAW]",
        JSON.stringify(body, null, 2)
      );
      try {
        ensureOkOrThrow(body, "Dodawanie kontrahenta");
      } catch (detailed) {
        // >>> KLUCZOWE: zwróć 1:1 treść walidacji (field: message) do routera
        const msg = String(detailed.message || "").replace(
          /^Operacja nie powiodła się – /,
          ""
        );
        throw new Error(`[wFirma] ${msg}`);
      }
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
  const seriesId = await getSeriesId();
  const mode = String(process.env.WFIRMA_MODE || "proforma").toLowerCase();
  const isNormal = mode === "normal";

  // --- token do pola <paymentmethod> w fakturze: transfer | cash | cod | payment_card | compensation
  function mapInvoicePaymentMethodToken({ paymentMethod, deliveryMethod }) {
    if (paymentMethod === "cod" || deliveryMethod === "courier_cod")
      return "cod";
    if (deliveryMethod === "pickup" && paymentMethod === "cod") return "cash";
    if (paymentMethod === "przelewy24") return "transfer"; // ewentualnie 'payment_card' jeśli tak wolicie
    if (paymentMethod === "bank_transfer") return "transfer";
    return "transfer";
  }

  const date = order.issueDate || today();
  const paid = !!order.isPaid;
  const wfPaymentMethod = mapInvoicePaymentMethodToken(order);

  // terminy (zostawiamy jak było)
  const paymentdays = paid ? 0 : 7;
  const paymentdate = paid ? date : date;

  // pozycje
  const itemsXml = (order.items || [])
    .map(
      (it) => `
        <invoicecontent>
          <name>${escapeXml(it.name)}</name>
          <count>${to2(it.totalUnits)}</count>
          <unit>${escapeXml(it.unit || "szt")}</unit>
          <price>${to2(it.priceBrut)}</price>
          <vat>${escapeXml(toWfirmaVat(it.vatRate))}</vat>
        </invoicecontent>`
    )
    .join("");

  // dostawa
  const shippingXml = order.shippingCost
    ? `
        <invoicecontent>
          <name>Koszt dostawy</name>
          <count>1</count>
          <unit>szt</unit>
          <price>${to2(order.shippingCost)}</price>
          <vat>${escapeXml(
            order.shippingVatRate || WFIRMA_SHIPPING_VAT || "23"
          )}</vat>
        </invoicecontent>`
    : "";

  // suma brutto (pozycje + dostawa)
  const itemsTotal = (order.items || []).reduce(
    (acc, it) => acc + Number(it.priceBrut || 0) * Number(it.totalUnits || 0),
    0
  );
  const shippingTotal = order.shippingCost ? Number(order.shippingCost) : 0;
  const grandTotal = Number((itemsTotal + shippingTotal).toFixed(2));

  const alreadypaidInitialXml = paid
    ? `<alreadypaid_initial>${to2(grandTotal)}</alreadypaid_initial>`
    : "";

  const xml = `
  <api>
    <invoices>
      <invoice>
        <contractor_id>${contractorId}</contractor_id>
        ${seriesId ? `<series><id>${seriesId}</id></series>` : ``}
        <type>${isNormal ? "normal" : "proforma"}</type>
        <price_type>brutto</price_type>

        <paymentmethod>${escapeXml(wfPaymentMethod)}</paymentmethod>
        <paymentdate>${paymentdate}</paymentdate>
        <paymentdays>${paymentdays}</paymentdays>

        <date>${date}</date>
        <disposaldate>${date}</disposaldate>

        ${alreadypaidInitialXml}

        <invoicecontents>
          ${itemsXml}
          ${shippingXml}
        </invoicecontents>
      </invoice>
    </invoices>
  </api>`.trim();

  const res = await api.post("/invoices/add", xml);
  ensureOkOrThrow(res.data, "Tworzenie dokumentu");
  const ent = pickFirstEntity(res.data, "invoices", "invoice");
  return { id: String(ent?.id), number: String(ent?.fullnumber || "") };
}

// --- PDF ---
async function getDocumentPdf(invoiceId) {
  // Minimalne body (możesz dodać parametry z dokumentacji, np. page=all)
  const bodyXml = `
  <api>
    <invoices>
      <parameters>
        <parameter><name>page</name><value>all</value></parameter>
        <parameter><name>address</name><value>0</value></parameter>
        <parameter><name>leaflet</name><value>0</value></parameter>
        <parameter><name>duplicate</name><value>0</value></parameter>
        <parameter><name>payment_cashbox_documents</name><value>0</value></parameter>
        <parameter><name>warehouse_documents</name><value>0</value></parameter>
      </parameters>
    </invoices>
  </api>`.trim();

  try {
    const res = await api.post(
      // <— ŚCIEŻKA z ID, zgodnie z dokumentacją
      `/invoices/download/${invoiceId}`,
      bodyXml,
      {
        responseType: "arraybuffer",
        headers: { Accept: "application/pdf" },
        // <— Nadpisujemy PARAMS, żeby NIE było globalnego outputFormat=json
        params: {
          company_id: WFIRMA_COMPANY_ID,
          inputFormat: "xml",
          // UWAGA: brak outputFormat — wtedy API zwraca binarny PDF, honorując Accept
        },
      }
    );

    const buf = Buffer.from(res.data);
    // sanity-check: pierwszy bytes PDF
    if (!buf.slice(0, 5).toString().startsWith("%PDF-")) {
      const preview = buf.toString("utf8").slice(0, 200);
      console.error("[wFirma download] Nie wygląda na PDF", {
        ct: res.headers?.["content-type"],
        preview,
      });
      throw new Error(
        "wFirma nie zwróciła PDF (sprawdź query params i invoiceId)."
      );
    }
    return buf;
  } catch (e) {
    // Dodatkowy debug: spróbuj wyciągnąć błąd w JSON
    try {
      const dbg = await api.post(`/invoices/download/${invoiceId}`, bodyXml, {
        responseType: "arraybuffer",
        headers: { Accept: "application/json" },
        params: {
          company_id: WFIRMA_COMPANY_ID,
          inputFormat: "xml",
          outputFormat: "json",
        },
      });
      const txt = Buffer.from(dbg.data).toString("utf8");
      console.error("[wFirma download DEBUG json]", txt.slice(0, 600));
    } catch {}
    throw normErr(e);
  }
}

module.exports = {
  upsertContractor,
  createDocument,
  getDocumentPdf,
};
