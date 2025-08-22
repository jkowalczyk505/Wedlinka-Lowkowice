// models/paymentModel.js
const db = require("../config/db");

const PaymentModel = {
  /**
   * Zapisuje płatność związaną z zamówieniem.
   * @param {Object} p
   * @param {number}  p.orderId        FK → orders.id
   * @param {string}  p.provider       'przelewy24' | 'bank_transfer' | 'cod'
   * @param {string}  p.amount         kwota brutto (np. "149.99")
   * @param {string}  p.currency       'PLN'
   * @param {string?} p.transactionId  token/link dla płatności online
   * @param {string}  p.status         'pending' | 'ok' | 'failed'
   */
  async create({ orderId, provider, amount, currency, transactionId, status }) {
    await db.query(
      `INSERT INTO payments
         (order_id, provider, amount, currency, transaction_id, status)
       VALUES (?,        ?,        ?,      ?,        ?,            ?)`,
      [orderId, provider, amount, currency, transactionId, status]
    );
  },

  // models/paymentModel.js
  async markPaidByOrderNumber(
    orderNumber,
    { providerTransactionId, amount, currency = "PLN", provider = "przelewy24" }
  ) {
    // 1) znajdź order_id
    const [[ord]] = await db.query(
      `SELECT id FROM orders WHERE order_number = ? LIMIT 1`,
      [orderNumber]
    );
    if (!ord) throw new Error("Order not found for orderNumber=" + orderNumber);

    // 2) idempotencja – jeśli już jest 'ok', to nic nie rób
    const [[existsOk]] = await db.query(
      `SELECT id FROM payments WHERE order_id = ? AND status = 'ok' LIMIT 1`,
      [ord.id]
    );
    if (existsOk) return;

    // 3) spróbuj zaktualizować istniejącą
    const [upd] = await db.query(
      `
    UPDATE payments
       SET status = 'ok',
           transaction_id = ?,
           amount = ?,
           currency = ?,
           provider = ?,
           updated_at = NOW()
     WHERE order_id = ?
       AND (status <> 'ok' OR status IS NULL)
    `,
      [providerTransactionId, amount, currency, provider, ord.id]
    );

    // 4) jeśli nie było 'pending' → wstaw nowy rekord 'ok'
    if (upd.affectedRows === 0) {
      await db.query(
        `
      INSERT INTO payments (order_id, provider, amount, currency, transaction_id, status)
      VALUES (?, ?, ?, ?, ?, 'ok')
      `,
        [ord.id, provider, amount, currency, providerTransactionId]
      );
      // Jeśli koniecznie musisz wpisywać timestamp ręcznie, użyj wariantu z created_at:
      // INSERT INTO payments (..., created_at) VALUES (..., NOW())
    }
  },

  async markFailedByOrderNumber(
    orderNumber,
    { providerTransactionId = null } = {}
  ) {
    const [[ord]] = await db.query(
      `SELECT id FROM orders WHERE order_number = ? LIMIT 1`,
      [orderNumber]
    );
    if (!ord) throw new Error("Order not found for orderNumber=" + orderNumber);

    const [upd] = await db.query(
      `
    UPDATE payments
       SET status = 'failed',
           transaction_id = COALESCE(?, transaction_id),
           updated_at = NOW()
     WHERE order_id = ?
       AND (status <> 'ok' OR status IS NULL)
    `,
      [providerTransactionId, ord.id]
    );

    // jeżeli nie było rekordu (lub nie 'pending'), wstaw ślad failed
    if (upd.affectedRows === 0) {
      await db.query(
        `
      INSERT INTO payments (order_id, provider, amount, currency, transaction_id, status, created_at)
      VALUES (?, 'przelewy24', 0, 'PLN', ?, 'failed', NOW())
      `,
        [ord.id, providerTransactionId]
      );
    }
  },
};

module.exports = PaymentModel;
