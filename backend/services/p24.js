// services/p24.js
// Integracja P24 (legacy /trnRegister, /trnVerify)

const crypto = require("crypto");

const {
  P24_MERCHANT_ID,
  P24_POS_ID,
  P24_CRC,
  P24_SANDBOX,
  PUBLIC_FRONTEND_URL,
  PUBLIC_BACKEND_URL,
  P24_DEBUG: P24_DEBUG_RAW,
} = process.env;

const P24_DEBUG = String(P24_DEBUG_RAW).toLowerCase() === "true";
const dbg = (...a) => P24_DEBUG && console.error("[P24]", ...a);

const BASE =
  String(P24_SANDBOX).toLowerCase() === "true"
    ? "https://sandbox.przelewy24.pl"
    : "https://secure.przelewy24.pl";

/* ---------- helpers ---------- */

function assertEnv() {
  const miss = [];
  if (!P24_MERCHANT_ID) miss.push("P24_MERCHANT_ID");
  if (!P24_POS_ID) miss.push("P24_POS_ID");
  if (!P24_CRC) miss.push("P24_CRC");
  if (!PUBLIC_FRONTEND_URL) miss.push("PUBLIC_FRONTEND_URL");
  if (!PUBLIC_BACKEND_URL) miss.push("PUBLIC_BACKEND_URL");
  if (miss.length) throw new Error("Brak zmiennych ENV: " + miss.join(", "));
  if (!/^https:\/\//.test(PUBLIC_FRONTEND_URL))
    throw new Error("PUBLIC_FRONTEND_URL musi zaczynać się od https://");
  if (!/^https:\/\//.test(PUBLIC_BACKEND_URL))
    throw new Error("PUBLIC_BACKEND_URL musi zaczynać się od https://");
}

const md5 = (x) => crypto.createHash("md5").update(x).digest("hex");
const toCents = (pln) => Math.round(Number(pln) * 100);
const sanitizeSessionId = (id) =>
  String(id)
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 100);

// --- SIGNY ---
// Rejestracja
function buildRegisterSign({ sessionId, amount, currency = "PLN" }) {
  return md5(
    `${sessionId}|${P24_MERCHANT_ID}|${amount}|${currency}|${P24_CRC}`
  );
}
// Weryfikacja (UWAGA: z order_id!)
function buildVerifySign({ sessionId, orderId, amount, currency = "PLN" }) {
  return md5(`${sessionId}|${orderId}|${amount}|${currency}|${P24_CRC}`);
}

function enc(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) p.append(k, String(v));
  return p;
}

/* ---------- API ---------- */

async function registerTransaction({
  sessionId,
  amountPln,
  email,
  description = "Zamowienie",
  returnUrl,
  cancelUrl,
}) {
  assertEnv();

  const amount = toCents(amountPln);
  const safeId = sanitizeSessionId(sessionId);

  // powrót kierujemy na backend – P24 dopnie p24_session_id, p24_order_id, p24_amount
  const p24UrlReturn = returnUrl || `${PUBLIC_BACKEND_URL}/api/p24/return`;
  const p24UrlCancel = cancelUrl || `${PUBLIC_BACKEND_URL}/api/p24/cancel`;

  const payload = {
    p24_merchant_id: String(P24_MERCHANT_ID),
    p24_pos_id: String(P24_POS_ID),
    p24_session_id: safeId,
    p24_amount: amount,
    p24_currency: "PLN",
    p24_description: description,
    p24_email: email,
    p24_country: "PL",
    p24_language: "pl",
    p24_url_return: p24UrlReturn,
    p24_url_cancel: p24UrlCancel,
    p24_url_status: `${PUBLIC_BACKEND_URL}/api/p24/notify`,
    p24_sign: buildRegisterSign({ sessionId: safeId, amount }),
    p24_api_version: "3.2",
  };

  const res = await fetch(`${BASE}/trnRegister`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "text/plain",
    },
    body: enc(payload),
  });

  const text = await res.text();
  dbg("REGISTER status:", res.status);
  dbg("REGISTER raw:", text);

  let token = null;
  if (text.includes("token=")) {
    token = (text.match(/token=([A-Za-z0-9._-]+)/) || [])[1] || null;
    const err = text.match(/error=(\d+)/);
    if (!token && err && err[1] !== "0")
      throw new Error(`P24 register error: ${text}`);
  } else {
    try {
      const json = JSON.parse(text);
      token = json?.data?.token || json?.token || null;
      if (!token && (json?.error || res.status >= 400))
        throw new Error(`P24 register error: ${text}`);
    } catch {
      throw new Error(`P24 register unexpected response: ${text}`);
    }
  }

  return { token, redirectUrl: `${BASE}/trnRequest/${token}` };
}

async function verifyTransaction({ sessionId, orderId, amountPln }) {
  assertEnv();

  const amount = toCents(amountPln);
  const safeId = sanitizeSessionId(sessionId);
  const numericOrderId = Number(orderId);

  const payload = {
    p24_merchant_id: String(P24_MERCHANT_ID),
    p24_pos_id: String(P24_POS_ID),
    p24_session_id: safeId,
    p24_amount: amount,
    p24_currency: "PLN",
    p24_order_id: numericOrderId,
    p24_sign: buildVerifySign({
      sessionId: safeId,
      orderId: numericOrderId,
      amount,
    }),
    p24_api_version: "3.2",
  };

  const res = await fetch(`${BASE}/trnVerify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "text/plain",
    },
    body: enc(payload),
  });

  const text = await res.text();
  dbg("VERIFY status:", res.status);
  dbg("VERIFY raw:", text);

  if (text.includes("error=")) {
    const m = text.match(/error=(\d+)/);
    if (!m || m[1] !== "0") throw new Error(`P24 verify error: ${text}`);
    return { ok: true };
  }

  try {
    const json = JSON.parse(text);
    if (json?.error && json.error !== 0)
      throw new Error(`P24 verify error: ${text}`);
    return { ok: true, ...json };
  } catch {
    throw new Error(`P24 verify unexpected response: ${text}`);
  }
}

module.exports = { registerTransaction, verifyTransaction };
