// models/orderModel.js
const db = require("../config/db");
const ReviewModel = require("./reviewModel");

const OrderModel = {
  async create(order) {
    const conn = await db.getConnection(); // <-- bierz osobne połączenie
    const crypto = require("crypto");
    const accessToken = crypto.randomBytes(16).toString("hex"); // 32 znaki
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
         (order_number, access_token, user_id,
          total_net, total_vat, total_brut,
          invoice_name, invoice_street, invoice_city, invoice_zip,
          invoice_country, invoice_type, invoice_nip, invoice_email)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          orderNumber,
          accessToken,
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
      return { id: result.insertId, orderNumber, accessToken };
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

    // 🔽 Teraz pobieramy e-mail i telefon z form — bez względu na fakturę
    const email = form.email?.trim() || null;
    const phone = form.phone?.trim() || null;

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
        email,
        phone,
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

  async getFullSummary(orderNumber, token) {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE order_number = ? AND access_token = ? LIMIT 1`,
      [orderNumber, token]
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

  async getAllAdmin() {
    const [rows] = await db.query(
      `SELECT
      o.id,
      o.order_number,
      o.created_at,
      o.total_brut,
      s.cost           AS shipping_cost,
      o.status         AS order_status,
      p.provider       AS payment_method,
      p.status         AS payment_status,
      s.method         AS shipping_method
     FROM orders o
     LEFT JOIN payments p         ON p.order_id = o.id
     LEFT JOIN shipping_details s ON s.order_id = o.id
     ORDER BY o.created_at DESC`
    );
    return rows;
  },

  // ADMIN: zmień status zamówienia
  async updateStatus(id, status) {
    await db.query(
      `UPDATE orders
         SET status     = ?,
             updated_at = NOW()
       WHERE id = ?`,
      [status, id]
    );
  },

  // ADMIN: zmień status płatności
  async updatePaymentStatus(orderId, status) {
    await db.query(
      `UPDATE payments
         SET status     = ?,
             updated_at = NOW()
       WHERE order_id = ?`,
      [status, orderId]
    );
  },
  // Ostatnie 2 zamowienia klienta
  async getLatestForUser(userId, limit = 2) {
    const [rows] = await db.query(
      `SELECT  o.id
           ,o.order_number
           ,o.created_at
           ,( o.total_brut
              + IFNULL(
                 (SELECT cost FROM shipping_details WHERE order_id = o.id LIMIT 1)
               ,0) )                                 AS totalWithShip
           ,o.status
           ,CAST(
              ( SELECT SUM(quantity)
                  FROM order_items oi
                WHERE oi.order_id = o.id
              ) AS SIGNED
            ) AS itemsCount
       FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT ?`,
      [userId, Number(limit)]
    );

    for (const row of rows) {
      // 1) trzy miniaturki
      const [thumbs] = await db.query(
        `SELECT p.image
          FROM order_items oi
          JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = ?
          GROUP BY p.id
          ORDER BY oi.id
          LIMIT 3`,
        [row.id]
      );
      row.images = thumbs.map((r) => r.image).filter(Boolean);

      // 2) ile w sumie **różnych** produktów
      const [[{ distinctCount }]] = await db.query(
        `SELECT COUNT(DISTINCT product_id) AS distinctCount
          FROM order_items
          WHERE order_id = ?`,
        [row.id]
      );
      row.distinctCount = distinctCount;
    }

    return rows;
  },

  // Szczegoly rozwinietego zamowienia dla klienta
  async getSummaryForUser(orderId, userId) {
    // 1. Nagłówek + status + kwoty
    const [[o]] = await db.query(
      `SELECT id, order_number, status,
              total_net, total_vat, total_brut,
              created_at,
              invoice_type, invoice_name, invoice_nip,
              invoice_email, invoice_street, invoice_city,
              invoice_zip, invoice_country
        FROM orders
        WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );
    if (!o) return null;

    // 2. Pozycje koszyka — pobieramy surowe wiersze
    const [items] = await db.query(
      `SELECT oi.quantity,
              p.id             AS id,
              p.name           AS name,
              p.slug           AS slug,
              p.image          AS image,
              p.category       AS category,
              p.unit           AS unit,
              p.quantity         AS quantityPerUnit,       -- <— tu
              oi.price_brut_snapshot AS price
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?`,
      [orderId]
    );

    // dopisujemy flaga canReview bez żadnego it.product
    for (const it of items) {
      const pid = it.id;
      const bought = await OrderModel.userBoughtProduct(userId, pid);
      const existing = await ReviewModel.findByUserAndProduct(userId, pid);
      it.canReview = bought && !existing;
    }

    // 3. Dostawa + płatność
    const [[ship]] = await db.query(
      `SELECT method, cost, locker_code, tracking_number,
         recipient_first_name, recipient_last_name,
         street, city, postal_code,
         recipient_email, recipient_phone, notes
    FROM shipping_details
   WHERE order_id = ?`,
      [orderId]
    );

    const [[pay]] = await db.query(
      `SELECT provider, amount, status
    FROM payments WHERE order_id = ?`,
      [orderId]
    );

    const payment = {
      ...pay,
      title: o.order_number,
      bankAccount: process.env.BANK_ACCOUNT || "BRAK_NUMERU_KONTA",
    };

    const invoice = o.invoice_type
      ? {
          type: o.invoice_type,
          name: o.invoice_name,
          nip: o.invoice_nip,
          email: o.invoice_email,
          street: o.invoice_street,
          city: o.invoice_city,
          zip: o.invoice_zip,
          country: o.invoice_country,
        }
      : null;

    return { order: o, items, shipping: ship, payment, invoice };
  },

  async getByIdAdmin(id) {
    const [[o]] = await db.query(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (!o) return null;

    const [items] = await db.query(
      `SELECT oi.quantity,
              p.id, p.name, p.slug, p.image, p.category,
              p.unit, p.quantity AS quantityPerUnit,
              oi.price_brut_snapshot AS price
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [id]
    );

    const [shippingRows] = await db.query(
      `SELECT * FROM shipping_details WHERE order_id = ? LIMIT 1`,
      [id]
    );
    const ship = shippingRows[0] || {};

    const [paymentRows] = await db.query(
      `SELECT * FROM payments WHERE order_id = ? LIMIT 1`,
      [id]
    );
    const pay = paymentRows[0] || {};

    const invoice = {
      type: o.invoice_type,
      name: o.invoice_name,
      nip: o.invoice_nip,
      email: o.invoice_email,
      street: o.invoice_street,
      city: o.invoice_city,
      zip: o.invoice_zip,
      country: o.invoice_country,
    };

    return {
      order: o,
      items: items.map((it) => ({ ...it, price: Number(it.price) })),
      shipping: {
        ...ship,
        name:
          ship.method === "pickup"
            ? "Odbiór osobisty"
            : ship.method === "inpost"
            ? "Paczkomat InPost"
            : "Kurier",
        priceTotal: ship.cost,
        deliveryMethod: ship.method,
      },
      payment: {
        ...pay,
        title: o.order_number,
        bankAccount: process.env.BANK_ACCOUNT || "BRAK_NUMERU_KONTA",
      },
      invoice,
    };
  },

  async updateTrackingNumber(orderId, trackingNumber) {
    await db.query(
      `UPDATE shipping_details
          SET tracking_number = ?
        WHERE order_id = ?`,
      [trackingNumber, orderId]
    );
  },

  // --- używane przez P24 webhook/return ---
  async getByOrderNumber(orderNumber) {
    const [rows] = await db.query(
      `SELECT o.id,
              o.order_number,
              o.status,
              o.total_brut,
              IFNULL(s.cost,0)         AS shipping_cost,
              p.status                 AS payment_status
         FROM orders o
         LEFT JOIN shipping_details s ON s.order_id = o.id
         LEFT JOIN payments p         ON p.order_id = o.id
        WHERE o.order_number = ?
        LIMIT 1`,
      [orderNumber]
    );
    return rows[0] || null;
  },

  async updatePaymentStatusByOrderNumber(orderNumber, status) {
    await db.query(
      `UPDATE payments
        SET status = ?, updated_at = NOW()
      WHERE order_id = (SELECT id FROM orders WHERE order_number = ? LIMIT 1)
        AND (status <> 'ok' OR status IS NULL)`,
      [status, orderNumber]
    );
  },

  async updateStatusByOrderNumber(orderNumber, status) {
    await db.query(
      `UPDATE orders
          SET status = ?, updated_at = NOW()
        WHERE order_number = ?`,
      [status, orderNumber]
    );
  },
};

module.exports = OrderModel;
