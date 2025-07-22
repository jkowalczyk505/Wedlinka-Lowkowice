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
};

module.exports = PaymentModel;
