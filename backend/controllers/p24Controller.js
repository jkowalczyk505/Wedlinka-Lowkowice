// controllers/p24Controller.js
const OrderModel = require("../models/orderModel");
const PaymentModel = require("../models/paymentModel");
const { verifyTransaction } = require("../services/p24");

function parsePossiblyStringBody(req) {
  // Standardowo express.urlencoded zdekoduje to do obiektu.
  // Jeśli jednak przyszło jako surowy string, spróbujemy zdekodować ręcznie.
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

/**
 * P24 legacy → url_status
 * Body: p24_session_id, p24_order_id, p24_amount (grosze), p24_currency
 */
async function notify(req, res) {
  try {
    console.error(
      "[P24] NOTIFY HIT",
      req.headers["content-type"] || "",
      req.method
    );

    const body = parsePossiblyStringBody(req);
    console.error("[P24] NOTIFY BODY:", body);

    const sessionId = body.p24_session_id;
    const orderId = body.p24_order_id; // id transakcji w P24
    const amountFromP24 = body.p24_amount; // grosze
    const currency = body.p24_currency || "PLN";

    if (!sessionId || !orderId) {
      console.error("[P24] NOTIFY ERROR: missing sessionId/orderId", {
        sessionId,
        orderId,
      });
      return res.status(400).json({ error: "Brak sessionId lub orderId" });
    }

    // 1) Pobierz zamówienie
    const order = await OrderModel.getByOrderNumber(sessionId);
    if (!order) {
      console.error("[P24] NOTIFY ERROR: order not found", sessionId);
      return res.status(404).json({ error: "Zamówienie nie istnieje" });
    }

    // 2) Kwota: użyj tej z P24 (w zł)
    const amountPlnFromP24 = Number(amountFromP24) / 100;
    const totalPlnDb =
      Number(order.total_brut) + Number(order.shipping_cost || 0);

    // Ostrzegaj, jeśli rozjazd, ale weryfikuj kwotę z P24
    if (
      Number.isFinite(amountPlnFromP24) &&
      Math.abs(amountPlnFromP24 - totalPlnDb) > 0.01
    ) {
      console.error("[P24] WARN: amount mismatch P24 vs DB", {
        sessionId,
        p24: amountPlnFromP24,
        db: totalPlnDb,
      });
    }

    // 3) Idempotencja
    if (order.payment_status === "paid" || order.status === "paid") {
      console.error("[P24] NOTIFY: already paid, skipping updates", sessionId);
      return res.json({ ok: true, alreadyPaid: true });
    }

    // 4) Verify w P24 – przekazujemy kwotę, którą zna P24
    try {
      const vr = await verifyTransaction({
        sessionId,
        orderId,
        amountPln: amountPlnFromP24 || totalPlnDb,
      });
      console.error("[P24] VERIFY OK:", vr);
    } catch (e) {
      console.error("[P24] VERIFY FAIL:", e?.message || e);
      // Zwracamy 200, żeby P24 nie katował retry, a Ty masz log przyczyny
      return res
        .status(200)
        .json({ ok: false, verifyError: String(e?.message || e) });
    }

    // 5) Aktualizacja DB
    try {
      await PaymentModel.markPaidByOrderNumber(sessionId, {
        providerTransactionId: String(orderId),
        amount: amountPlnFromP24 || totalPlnDb,
        currency,
      });
    } catch (e) {
      console.error("[P24] DB ERROR (payment):", e);
      // nie przerywamy — spróbujemy zaktualizować status zamówienia
    }

    try {
      await OrderModel.updatePaymentStatusByOrderNumber(sessionId, "paid");
      await OrderModel.updateStatusByOrderNumber(sessionId, "paid");
    } catch (e) {
      console.error("[P24] DB ERROR (order status):", e);
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error("P24 notify error (top-level):", e);
    // 200 OK — P24 uspokoi retry, a Ty masz logi
    return res.status(200).json({ ok: false });
  }
}

module.exports = { notify };
