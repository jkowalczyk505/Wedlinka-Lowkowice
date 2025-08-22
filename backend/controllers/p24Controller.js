// controllers/p24Controller.js
const OrderModel = require("../models/orderModel");
const PaymentModel = require("../models/paymentModel");
const { verifyTransaction } = require("../services/p24");

const FRONT_URL = process.env.PUBLIC_FRONTEND_URL || "";

/* -------- helpers -------- */

function parsePossiblyStringBody(req) {
  if (
    req.body &&
    typeof req.body === "object" &&
    Object.keys(req.body).length > 0
  ) {
    return req.body;
  }
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      const params = new URLSearchParams(req.body);
      return Object.fromEntries(params.entries());
    } catch {}
  }
  return req.body || {};
}

function logP24Hit(label, req, extra = {}) {
  try {
    console.log(
      `[P24 ${label}] ip=${req.ip} ua="${req.get("user-agent")}" ct=${
        req.headers["content-type"]
      } method=${req.method}`,
      extra
    );
  } catch {}
}

/* -------- webhook: url_status -------- */
/**
 * P24 legacy → url_status (POST)
 * Body: p24_session_id, p24_order_id, p24_amount (grosze), p24_currency
 */
async function notify(req, res) {
  logP24Hit("notify", req);
  let phase = "start";
  try {
    const body = parsePossiblyStringBody(req);
    console.error("[P24] NOTIFY BODY:", body);

    const sessionId = body.p24_session_id;
    const orderId = body.p24_order_id;
    const amountFromP24 = body.p24_amount; // grosze
    const currency = body.p24_currency || "PLN";

    phase = "validate-input";
    if (!sessionId || !orderId) {
      return res
        .status(200)
        .json({ ok: false, phase, error: "Brak sessionId lub orderId" });
    }

    phase = "load-order";
    const order = await OrderModel.getByOrderNumber(sessionId);
    if (!order) {
      return res
        .status(200)
        .json({ ok: false, phase, error: "Zamówienie nie istnieje" });
    }

    const amountPlnFromP24 = Number(amountFromP24) / 100;
    const totalPlnDb =
      Number(order.total_brut) + Number(order.shipping_cost || 0);

    // idempotencja: jak payment ma 'ok' albo order ma 'paid' – kończymy
    const paidSet = new Set(["ok", "paid", "completed"]);
    if (
      paidSet.has(String(order.payment_status || "").toLowerCase()) ||
      paidSet.has(String(order.status || "").toLowerCase())
    ) {
      return res.json({ ok: true, phase: "already-paid" });
    }

    phase = "verify";
    try {
      const vr = await verifyTransaction({
        sessionId,
        orderId,
        amountPln: Number.isFinite(amountPlnFromP24)
          ? amountPlnFromP24
          : totalPlnDb,
      });
      console.error("[P24] VERIFY OK:", vr);
    } catch (e) {
      return res
        .status(200)
        .json({ ok: false, phase, error: String(e?.message || e) });
    }

    phase = "db-update-payment";
    try {
      await PaymentModel.markPaidByOrderNumber(sessionId, {
        providerTransactionId: String(orderId),
        amount: Number.isFinite(amountPlnFromP24)
          ? amountPlnFromP24
          : totalPlnDb,
        currency,
      });
    } catch (e) {
      return res.status(200).json({
        ok: false,
        phase,
        error: "DB payment update failed: " + String(e?.message || e),
      });
    }

    phase = "db-update-order";
    try {
      // Uwaga: payments.status = 'ok', orders.status = 'paid'
      await OrderModel.updatePaymentStatusByOrderNumber(sessionId, "ok");
      await OrderModel.updateStatusByOrderNumber(sessionId, "paid");
    } catch (e) {
      return res.status(200).json({
        ok: false,
        phase,
        error: "DB order update failed: " + String(e?.message || e),
      });
    }

    return res.json({ ok: true, phase: "done" });
  } catch (e) {
    return res
      .status(200)
      .json({ ok: false, phase, error: String(e?.message || e) });
  }
}

/* -------- powrót klienta z P24 -------- */
async function returnAfterPay(req, res) {
  logP24Hit("return", req, { query: req.query });
  try {
    const sessionId =
      req.query.p24_session_id ||
      req.query.sessionId ||
      req.query.order ||
      req.query.orderNumber;

    const orderId = req.query.p24_order_id || req.query.orderId || null;
    const token = req.query.token || null;

    const amountPlnFromQuery = req.query.p24_amount
      ? Number(req.query.p24_amount) / 100
      : null;

    if (!sessionId) {
      return res.status(400).send("Brak numeru zamówienia.");
    }

    try {
      const order = await OrderModel.getByOrderNumber(sessionId);
      if (order && orderId) {
        const totalPlnDb =
          Number(order.total_brut) + Number(order.shipping_cost || 0);
        const amountToVerify = Number.isFinite(amountPlnFromQuery)
          ? amountPlnFromQuery
          : totalPlnDb;

        await verifyTransaction({
          sessionId,
          orderId,
          amountPln: amountToVerify,
        });

        await PaymentModel.markPaidByOrderNumber(sessionId, {
          providerTransactionId: String(orderId),
          amount: amountToVerify,
          currency: "PLN",
        });

        await OrderModel.updatePaymentStatusByOrderNumber(sessionId, "ok");
        await OrderModel.updateStatusByOrderNumber(sessionId, "paid");
      }
    } catch (e) {
      console.error("P24 return verify/update error:", e?.message || e);
      // nie blokujemy powrotu – /notify też to domknie
    }

    const redirectTo = `${FRONT_URL}/podsumowanie?order=${encodeURIComponent(
      sessionId
    )}${token ? `&token=${encodeURIComponent(token)}` : ""}`;
    return res.redirect(302, redirectTo);
  } catch (e) {
    console.error("P24 return error (top-level):", e);
    return res.status(500).send("Błąd powrotu z płatności.");
  }
}

module.exports = { notify, returnAfterPay };
