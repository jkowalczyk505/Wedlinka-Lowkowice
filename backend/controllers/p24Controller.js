// controllers/p24Controller.js
const OrderModel = require("../models/orderModel");
const PaymentModel = require("../models/paymentModel");
const { verifyTransaction } = require("../services/p24");

const FRONT_URL = process.env.PUBLIC_FRONTEND_URL || "";
const FAIL_URL =
  process.env.PUBLIC_FRONTEND_FAIL_URL || `${FRONT_URL}/platnosc-niepowodzenie`;

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

/* -------- webhook: url_status (POST) -------- */
/**
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

    // idempotencja
    const paidSet = new Set(["ok", "paid", "completed"]);
    if (
      paidSet.has(String(order.payment_status || "").toLowerCase()) ||
      paidSet.has(String(order.status || "").toLowerCase())
    ) {
      return res.json({ ok: true, phase: "already-paid" });
    }

    phase = "verify";
    try {
      await verifyTransaction({
        sessionId,
        orderId,
        amountPln: Number.isFinite(amountPlnFromP24)
          ? amountPlnFromP24
          : totalPlnDb,
      });
    } catch (e) {
      // 🔴 WERYFIKACJA NIE PRZESZŁA → OZNACZ FAILED / CANCELLED
      try {
        await OrderModel.updatePaymentStatusByOrderNumber(sessionId, "failed");
        await OrderModel.updateStatusByOrderNumber(sessionId, "cancelled");
      } catch (e2) {
        console.error("[P24] FAIL path DB update error:", e2);
      }
      return res
        .status(200)
        .json({ ok: false, phase, error: String(e?.message || e) });
    }

    phase = "db-update-payment";
    try {
      // success: oznacz OK (albo skorzystaj z własnego markPaidByOrderNumber)
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

/* -------- powrót klienta z P24 (GET) -------- */
/**
 * Query: p24_session_id|sessionId|order|orderNumber, p24_order_id|orderId, p24_amount, token
 */
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
      // nie wyświetlamy 400 — kierujemy usera na stałą stronę błędu
      return res.redirect(302, FAIL_URL);
    }

    try {
      const order = await OrderModel.getByOrderNumber(sessionId);
      if (!order) {
        return res.redirect(302, `${FAIL_URL}`);
      }
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

        // sukces → podsumowanie
        const okUrl = `${FRONT_URL}/podsumowanie?order=${encodeURIComponent(
          sessionId
        )}${token ? `&token=${encodeURIComponent(token)}` : ""}`;
        return res.redirect(302, okUrl);
      }

      // brak orderId → oznacz failed/cancelled (jeśli nie opłacone) i przekieruj
      if (order) {
        const paidSet = new Set(["ok", "paid", "completed"]);
        const isPaid =
          paidSet.has(String(order.payment_status || "").toLowerCase()) ||
          paidSet.has(String(order.status || "").toLowerCase());
        if (!isPaid) {
          try {
            await PaymentModel.markFailedByOrderNumber(sessionId, {});
            await OrderModel.updatePaymentStatusByOrderNumber(
              sessionId,
              "failed"
            );
            await OrderModel.updateStatusByOrderNumber(sessionId, "cancelled");
          } catch (e2) {
            console.error("[P24 return] mark failed (no orderId) error:", e2);
          }
        }
      }
      return res.redirect(302, FAIL_URL);
    } catch (e) {
      // 🔴 weryfikacja nie przeszła – oznacz failed/cancelled i skieruj na stronę niepowodzenia
      try {
        await OrderModel.updatePaymentStatusByOrderNumber(sessionId, "failed");
        await OrderModel.updateStatusByOrderNumber(sessionId, "cancelled");
      } catch (e2) {
        console.error("[P24 return] FAIL path DB update error:", e2);
      }

      return res.redirect(302, FAIL_URL);
    }
  } catch (e) {
    console.error("P24 return error (top-level):", e);
    return res.redirect(302, FAIL_URL);
  }
}

async function cancel(req, res) {
  try {
    // P24 zwykle wysyła p24_session_id w body (POST x-www-form-urlencoded),
    // ale zabezpieczmy też querystring.
    const body = parsePossiblyStringBody(req);
    const sessionId =
      body?.p24_session_id ||
      req.query.p24_session_id ||
      req.query.order ||
      req.query.sessionId ||
      null;
    const orderId =
      body?.p24_order_id || req.query.p24_order_id || req.query.orderId || null;

    if (sessionId) {
      // oznacz płatność i zamówienie jako nieudane/anulowane
      try {
        await PaymentModel.markFailedByOrderNumber(sessionId, {
          providerTransactionId: orderId ? String(orderId) : null,
        });
      } catch (e) {
        console.error("[P24 cancel] markFailed error:", e);
      }
      try {
        await OrderModel.updatePaymentStatusByOrderNumber(sessionId, "failed");
        await OrderModel.updateStatusByOrderNumber(sessionId, "cancelled");
      } catch (e) {
        console.error("[P24 cancel] update order error:", e);
      }
    }

    // przekieruj na stronę podsumowania z info o błędzie
    return res.redirect(302, FAIL_URL);
  } catch (e) {
    console.error("[P24 cancel] top-level error:", e);
    return res.status(500).send("Błąd anulowania płatności.");
  }
}

module.exports = { notify, returnAfterPay, cancel };
