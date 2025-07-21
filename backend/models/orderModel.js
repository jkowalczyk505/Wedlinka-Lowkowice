const db = require("../config/db");

const OrderModel = {
  // models/orderModel.js
  async create(order) {
    const conn = await db.getConnection(); // <-- bierz osobne połączenie
    try {
      await conn.beginTransaction();

      /* 1. Pobieramy następny AUTO_INCREMENT i blokujemy do końca TX */
      const [[{ nextId }]] = await conn.query(
        `SELECT AUTO_INCREMENT AS nextId
           FROM information_schema.TABLES
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME   = 'orders'
          FOR UPDATE`
      );

      /* 2. Składamy numer zamówienia, np. WLK-2025-000123 */
      const orderNumber =
        "WLK-" +
        new Date().getFullYear() +
        "-" +
        String(nextId).padStart(6, "0");

      /* 3. INSERT już z order_number (NOT NULL!) */
      const { user_id, form, invoice_type, total_net, total_vat, total_brut } =
        order;

      const isInvoice = invoice_type === "person" || invoice_type === "company";
      const invoiceName = isInvoice
        ? invoice_type === "company"
          ? form.companyName
          : `${form.firstName} ${form.lastName}`
        : null;

      const invoiceStreet = isInvoice
        ? form.address + (form.address2 ? "/" + form.address2 : "")
        : null;

      const [result] = await conn.query(
        `INSERT INTO orders
         (order_number, user_id,
          total_net, total_vat, total_brut,
          invoice_name, invoice_street, invoice_city, invoice_zip,
          invoice_country, invoice_type, invoice_nip, invoice_email)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          orderNumber,
          user_id,
          total_net,
          total_vat,
          total_brut,
          invoiceName,
          invoiceStreet,
          isInvoice ? form.city : null,
          isInvoice ? form.zip : null,
          isInvoice ? form.country || "Polska" : null,
          invoice_type,
          invoice_type === "company" ? form.nip : null,
          isInvoice ? form.email : null,
        ]
      );

      await conn.commit();
      return { id: result.insertId, orderNumber };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async addOrderItems(orderId, items) {
    const values = items.map((item) => {
      const brut = Number(item.product.price_brut); // 40.00
      const vat = Number(item.product.vat_rate); // 0.05
      // ► gwarantujemy zapis dziesiętny z kropką, bez „e+…”
      const net = (brut / (1 + vat)).toFixed(2); // "38.10"

      return [
        orderId,
        item.product.id,
        net, // price_net_snapshot
        vat, // vat_rate_snapshot
        brut, // price_brut_snapshot
        item.quantity, // quantity
      ];
    });

    // UWAGA: kolejność kolumn = kolejność wartości!
    await db.query(
      `INSERT INTO order_items
     (order_id, product_id, price_net_snapshot, vat_rate_snapshot, price_brut_snapshot, quantity)
     VALUES ?`,
      [values]
    );
  },

  // models/orderModel.js
  async addShippingDetails(orderId, form, selectedShipping, lockerCode) {
    const first = form.firstName;
    const last = form.lastName;
    const street = form.address + (form.address2 ? " " + form.address2 : "");

    // Bezpieczne wyliczenie kosztu
    const cost = selectedShipping.priceTotal ?? selectedShipping.price ?? 0;

    await db.query(
      `INSERT INTO shipping_details
       (order_id,
        recipient_first_name, recipient_last_name,
        street, city, postal_code,
        method, cost, locker_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        first,
        last,
        street,
        form.city,
        form.zip,
        selectedShipping.id,
        cost, // ← nigdy NULL
        lockerCode || null,
      ]
    );
  },
};

module.exports = OrderModel;
