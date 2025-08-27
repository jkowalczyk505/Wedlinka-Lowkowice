// backend/services/wfirma.js
const axios = require("axios");

const {
  WFIRMA_ACCESS_KEY,
  WFIRMA_SECRET_KEY,
  WFIRMA_COMPANY_ID,
  WFIRMA_SERIES,
  WFIRMA_MODE, // 'proforma' | 'normal'
} = process.env;

// 1) klient axios do API wFirma
const api = axios.create({
  baseURL: "https://api2.wfirma.pl", // jeśli masz inny host z dokumentacji, podmień tu
  timeout: 15000,
  headers: {
    "Content-Type": "application/xml; charset=utf-8",
  },
  params: {
    company_id: WFIRMA_COMPANY_ID,
    inputFormat: "xml",
    outputFormat: "xml",
  },
  auth: {
    username: WFIRMA_ACCESS_KEY,
    password: WFIRMA_SECRET_KEY,
  },
});

// 2) helper do prostych błędów
function normErr(e) {
  if (e.response) {
    return new Error(`[wFirma ${e.response.status}] ${e.response.statusText}`);
  }
  return new Error(`[wFirma] ${e.message}`);
}

// 3) kontrahent: znajdź po NIP lub email; jeśli brak → dodaj
async function upsertContractor(billing) {
  // billing: { name, nip?, email, street, city, zip, country }
  try {
    // (A) spróbuj znaleźć (po NIP, a gdy brak – po email)
    // UWAGA: poniżej szkic – w zależności od API możesz użyć wyszukiwania po polu
    // lub będziesz musiała iterować wynik "find".
    // Tu zakładamy, że masz endpoint /contractors/find z filtrem.
    // Jeśli w Twojej dokumentacji jest inaczej – podmień request.
    /*
    const findXml = `<contractors><parameters><nip>${billing.nip || ""}</nip><email>${billing.email || ""}</email></parameters></contractors>`;
    const found = await api.post("/contractors/find", findXml);
    const contractorId = ... // wyciągnij ID z XML
    if (contractorId) return contractorId;
    */

    // (B) dodaj nowego
    const addXml = `
      <contractors>
        <contractor>
          <name>${escapeXml(billing.name)}</name>
          ${billing.nip ? `<nip>${escapeXml(billing.nip)}</nip>` : ""}
          <email>${escapeXml(billing.email || "")}</email>
          <street>${escapeXml(billing.street || "")}</street>
          <city>${escapeXml(billing.city || "")}</city>
          <zip>${escapeXml(billing.zip || "")}</zip>
          <country>${escapeXml(billing.country || "PL")}</country>
        </contractor>
      </contractors>
    `;
    const res = await api.post("/contractors/add", addXml);
    const id = extractXml(res.data, "id"); // helper poniżej
    if (!id) throw new Error("Brak ID kontrahenta w odpowiedzi");
    return id;
  } catch (e) {
    throw normErr(e);
  }
}

// 4) utwórz dokument: proforma (test) lub faktura (produkcyjnie)
async function createDocument({ contractorId, order }) {
  // order: Twój model zamówienia + tablica items [{name, qty, unit, vatRate, priceBrut}]
  // SERIA i tryb:
  const series = WFIRMA_SERIES;
  const isProforma = (WFIRMA_MODE || "proforma") === "proforma";

  // UWAGA: XML pozycji dopasuj do dokumentacji – nazwy pól (netto/brutto, stawki VAT itd.)
  const itemsXml = order.items.map((it) => `
    <invoicecontent>
      <name>${escapeXml(it.name)}</name>
      <count>${it.qty}</count>
      <unit>${escapeXml(it.unit || "szt")}</unit>
      <price_brutto>${to2(it.priceBrut)}</price_brutto>
      <vat>${escapeXml(it.vatRate || "23")}</vat>
    </invoicecontent>
  `).join("");

  // Jeśli chcesz mieć koszt dostawy na fakturze:
  const shippingXml = order.shippingCost
    ? `
      <invoicecontent>
        <name>Koszt dostawy</name>
        <count>1</count>
        <unit>szt</unit>
        <price_brutto>${to2(order.shippingCost)}</price_brutto>
        <vat>${escapeXml(order.shippingVatRate || "23")}</vat>
      </invoicecontent>
    `
    : "";

  const xml = `
    <invoices>
      <invoice>
        <contractor_id>${contractorId}</contractor_id>
        <series>${escapeXml(series)}</series>
        ${isProforma ? `<kind>proforma</kind>` : `<kind>normal</kind>`}
        <payment_kind>${escapeXml(order.isPaid ? "zapłacono" : "przelew")}</payment_kind>
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
    const id = extractXml(res.data, "id");
    const number = extractXml(res.data, "fullnumber");
    if (!id) throw new Error("Brak ID faktury w odpowiedzi");
    return { id, number };
  } catch (e) {
    throw normErr(e);
  }
}

// 5) PDF (pobranie)
async function getDocumentPdf(invoiceId) {
  try {
    // W niektórych API: /invoices/download lub /invoices/print
    const xml = `<invoices><parameters><invoice_id>${invoiceId}</invoice_id></parameters></invoices>`;
    const res = await api.post("/invoices/download", xml, {
      responseType: "arraybuffer",
      headers: { "Accept": "application/pdf" },
    });
    return Buffer.from(res.data);
  } catch (e) {
    throw normErr(e);
  }
}

// ------- utils -------
function escapeXml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
function to2(n) {
  return (Math.round(Number(n) * 100) / 100).toFixed(2);
}
function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
// bardzo prosty parser: wyciągnij zawartość pierwszego znacznika <tag>...</tag>
function extractXml(xmlString, tag) {
  const m = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(xmlString);
  return m ? m[1].trim() : null;
}

module.exports = {
  upsertContractor,
  createDocument,
  getDocumentPdf,
};
