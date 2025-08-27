// backend/routes/invoiceRoutes.js
const express = require("express");
const router = express.Router();
const { upsertContractor, createDocument, getDocumentPdf } = require("../services/wfirma");
const pool = require("../config/db"); // jeśli masz eksport poola; w razie czego zaimportuj tak jak w innych routach
const { protect, adminOnly } = require("../middleware/authMiddleware"); // użyj Twoich middleware

// POST /api/invoices/:orderId/create  (ADMIN) -> tworzy + wysyła
router.post("/:orderId/create", protect, adminOnly, async (req, res) => {
  const { orderId } = req.params;
  const conn = await pool.getConnection();
  try {
    const [orders] = await conn.query("SELECT * FROM orders WHERE id = ?", [orderId]);
    if (!orders.length) return res.status(404).json({ message: "Order not found" });
    const order = orders[0];

    if (!order.is_paid) return res.status(400).json({ message: "Order not paid" });
    if (!order.want_invoice) return res.status(400).json({ message: "Customer did not request invoice" });

    // czy już wystawiona?
    const [invs] = await conn.query("SELECT * FROM invoices WHERE order_id = ?", [orderId]);
    if (invs.length) {
      // idempotencja: nic nie tworzymy ponownie – ale możemy od razu wysłać jeszcze raz maila, jeśli chcesz
      return res.status(409).json({ message: "Already invoiced", invoice: invs[0] });
    }

    const [items] = await conn.query("SELECT * FROM order_items WHERE order_id = ?", [orderId]);

    const billing = {
      name: order.company_name || `${order.first_name} ${order.last_name}`,
      nip: order.nip || null,
      email: order.email,
      street: order.street,
      city: order.city,
      zip: order.zip,
      country: order.country || "PL",
    };

    const contractorId = await upsertContractor(billing);

    const { id: wfirmaId, number } = await createDocument({
      contractorId,
      order: {
        isPaid: !!order.is_paid,
        items: items.map((it) => ({
          name: it.name,
          qty: it.quantity,
          unit: it.unit,
          priceBrut: it.price_brut,
          vatRate: it.vat_rate,
        })),
        shippingCost: order.shipping_price || 0,
        shippingVatRate: order.shipping_vat_rate || "23",
      },
    });

    await conn.query(
      "INSERT INTO invoices (order_id, wfirma_invoice_id, wfirma_number, issue_date) VALUES (?, ?, ?, CURDATE())",
      [orderId, wfirmaId, number]
    );

    // pobierz PDF i wyślij mailem
    const pdf = await getDocumentPdf(wfirmaId);
    const emailService = require("../services/emailService");
    await emailService.sendMail({
      to: order.email,
      subject: `Faktura ${number} do zamówienia #${order.id}`,
      template: "invoiceEmail",
      vars: { orderNumber: order.id, invoiceNumber: number },
      attachments: [{ filename: `${number}.pdf`, content: pdf }],
    });

    res.json({ ok: true, invoice: { wfirmaId, number } });
  } catch (e) {
    console.error("[invoices/create+send]", e);
    res.status(500).json({ ok: false, message: e.message });
  } finally {
    conn.release();
  }
});

// GET /api/invoices/:orderId/pdf  (admin albo właściciel zamówienia)
router.get("/:orderId/pdf", protect, async (req, res) => {
  const { orderId } = req.params;
  const conn = await pool.getConnection();
  try {
    const [orders] = await conn.query("SELECT * FROM orders WHERE id = ?", [orderId]);
    if (!orders.length) return res.status(404).end();
    const order = orders[0];

    // autoryzacja: admin lub właściciel
    const isAdmin = req.user?.role === "admin";
    if (!isAdmin && String(order.user_id) !== String(req.user.id)) {
      return res.status(403).end();
    }

    const [invs] = await conn.query("SELECT * FROM invoices WHERE order_id = ?", [orderId]);
    if (!invs.length) return res.status(404).json({ message: "No invoice" });
    const inv = invs[0];

    const pdf = await getDocumentPdf(inv.wfirma_invoice_id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${inv.wfirma_number || "invoice"}.pdf"`);
    res.send(pdf);
  } catch (e) {
    console.error("[invoices/pdf]", e);
    res.status(500).json({ ok: false, message: e.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
