const db = require("../config/db");

const OrderModel = {
  // models/orderModel.js
  async create(order) {
    const { user_id, form, invoice_type, total_net, total_vat, total_brut } =
      order;

    // czy wstawiamy fakturę?
    const isInvoice = invoice_type === "person" || invoice_type === "company";

    // wybieramy albo companyName (gdy company), albo imię i nazwisko (gdy person)
    const invoiceName = isInvoice
      ? invoice_type === "company"
        ? form.companyName
        : `${form.firstName} ${form.lastName}`
      : null;

    const invoiceStreet = isInvoice
      ? form.address + (form.address2 ? "/" + form.address2 : "")
      : null;
    const invoiceCity = isInvoice ? form.city : null;
    const invoiceZip = isInvoice ? form.zip : null;
    const invoiceCountry = isInvoice ? form.country || "Polska" : null;
    const invoiceNip = invoice_type === "company" ? form.nip : null;
    const invoiceEmail = isInvoice ? form.email : null;

    const [result] = await db.query(
      `INSERT INTO orders
      (user_id,
       total_net, total_vat, total_brut,
       invoice_name, invoice_street, invoice_city, invoice_zip,
       invoice_country, invoice_type, invoice_nip, invoice_email)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        total_net,
        total_vat,
        total_brut,

        invoiceName,
        invoiceStreet,
        invoiceCity,
        invoiceZip,
        invoiceCountry,

        invoice_type,
        invoiceNip,
        invoiceEmail,
      ]
    );

    return result.insertId;
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

    await db.query(
      `INSERT INTO shipping_details
      (order_id,
       recipient_first_name, recipient_last_name,
       street, city, postal_code, method, cost, locker_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        first,
        last,
        street,
        form.city,
        form.zip,
        selectedShipping.id,
        selectedShipping.priceTotal,
        lockerCode || null,
      ]
    );
  },
};

module.exports = OrderModel;
