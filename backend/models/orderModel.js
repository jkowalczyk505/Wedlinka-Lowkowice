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
    const street = form.address + (form.address2 ? "/" + form.address2 : "");

    // Bezpieczne wyliczenie kosztu
    const cost = selectedShipping.priceTotal ?? selectedShipping.price ?? 0;

    await db.query(
      `INSERT INTO shipping_details
       (order_id,
        recipient_first_name, recipient_last_name,
        street, city, postal_code,
        method, cost, locker_code,
        recipient_email, recipient_phone, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        first,
        last,
        street,
        form.city,
        form.zip,
        selectedShipping.id,
        cost,
        lockerCode || null,
        form.email, // ← e-mail z formularza
        form.phone, // ← telefon z formularza
        form.notes || null,
      ]
    );
  },

  async userBoughtProduct(userId, productId) {
    const [rows] = await db.query(
      `SELECT 1
         FROM orders      o
         JOIN order_items i ON i.order_id = o.id
        WHERE o.user_id = ?
          AND i.product_id = ?
          AND o.status = 'delivered' -- „zaliczone” statusy
        LIMIT 1`,
      [userId, productId]
    );
    return rows.length > 0;
  },

  async getFullSummary(orderNumber) {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE order_number = ? LIMIT 1`,
      [orderNumber]
    );
    if (!orders.length) return null;

    const order = orders[0];

    const [orderItems] = await db.query(
      `SELECT oi.quantity,
        p.id, p.name, p.slug, p.image, p.category,
        p.unit, p.quantity       AS quantityPerUnit,
        oi.price_brut_snapshot AS price
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`,
      [order.id]
    );

    const items = orderItems.map((item) => ({
      quantity: item.quantity,
      product: {
        id: item.id,
        name: item.name,
        slug: item.slug,
        image: item.image,
        category: item.category,
        unit: item.unit,
        quantityPerUnit: item.quantityPerUnit,
        price: Number(item.price),
      },
    }));

    const [shippingRows] = await db.query(
      `SELECT *,
              recipient_email,
              recipient_phone
         FROM shipping_details
        WHERE order_id = ? LIMIT 1`,
      [order.id]
    );
    const shipping = shippingRows[0] || {};

    const [paymentRows] = await db.query(
      `SELECT * FROM payments WHERE order_id = ? LIMIT 1`,
      [order.id]
    );
    const pay = paymentRows[0] || {};

    const rawStreet = shipping.street || "";
    // proste split na slash
    const [addr, apt] = rawStreet.split("/");
    const form = {
      firstName: shipping.recipient_first_name,
      lastName: shipping.recipient_last_name,
      address: addr,
      zip: shipping.postal_code,
      city: shipping.city,
      country: "Polska",
      email: shipping.recipient_email, // ← teraz z shipping_details
      phone: shipping.recipient_phone,
      wantsInvoice: !!order.invoice_type,
      companyName: order.invoice_name,
      nip: order.invoice_nip,
      address2: apt || "",
      notes: shipping.notes || "",
    };

    const invoice = {
      type: order.invoice_type,
      name: order.invoice_name,
      street: order.invoice_street,
      city: order.invoice_city,
      zip: order.invoice_zip,
      country: order.invoice_country,
      nip: order.invoice_nip,
      email: order.invoice_email,
    };

    return {
      orderNumber: order.order_number,
      items,
      shipping: {
        id: shipping.method,
        name:
          shipping.method === "pickup"
            ? "Odbiór osobisty"
            : shipping.method === "inpost"
            ? "Paczkomat InPost"
            : "Kurier",
        priceTotal: shipping.cost,
        lockerCode: shipping.locker_code,
      },
      payment: {
        method: pay.provider,
        amount: pay.amount,
        status: pay.status,
        title: order.order_number,
        bankAccount:
          process.env.BANK_ACCOUNT || "12 3456 0000 1111 2222 3333 4444",
        deliveryMethod: shipping.method,
      },
      form,
      invoice,
      orderStatus: order.status,
    };
  },
};

module.exports = OrderModel;
