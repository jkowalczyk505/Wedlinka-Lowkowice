const express = require("express");
const router = express.Router();
const {
  upsertContractor,
  createDocument,
  getDocumentPdf,
} = require("../services/wfirma");
const pool = require("../config/db");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const SHIPPING_VAT_DEFAULT = process.env.WFIRMA_SHIPPING_VAT || "23";

// POST /api/invoices/:orderId/create  (ADMIN)
router.post("/:orderId/create", protect, adminOnly, async (req, res) => {
  const { orderId } = req.params;
  const conn = await pool.getConnection();
  try {
    // --- zamówienie ---
    const [orders] = await conn.query("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);
    if (!orders.length)
      return res.status(404).json({ message: "Order not found" });
    const order = orders[0];

    // --- płatność ---
    const [payRows] = await conn.query(
      "SELECT status, provider FROM payments WHERE order_id = ? LIMIT 1",
      [orderId]
    );
    const pay = payRows[0];
    if (!pay || pay.status !== "ok") {
      return res.status(400).json({ message: "Order not paid" });
    }

    // --- czy klient chciał fakturę ---
    if (!order.invoice_type) {
      return res
        .status(400)
        .json({ message: "Customer did not request invoice" });
    }

    // --- już wystawiona? (idempotencja) ---
    const [invs] = await conn.query(
      "SELECT * FROM invoices WHERE order_id = ?",
      [orderId]
    );
    if (invs.length) {
      return res
        .status(409)
        .json({ message: "Already invoiced", invoice: invs[0] });
    }

    // --- pozycje (JOIN z products, bo order_items nie ma name/unit) ---
    const [items] = await conn.query(
      `SELECT 
         p.name,
         p.unit,
         p.quantity              AS per_unit,     -- <── DODANE
         oi.quantity         AS qty,
         oi.price_brut_snapshot AS price_brut,
         oi.vat_rate_snapshot   AS vat_rate
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?`,
      [orderId]
    );

    // --- dostawa ---
    const [[shipping]] = await conn.query(
      "SELECT cost, method FROM shipping_details WHERE order_id = ? LIMIT 1",
      [orderId]
    );

    // --- dane do kontrahenta bierzemy z kolumn invoice_* ---
    const billing = {
      name: order.invoice_name,
      nip: order.invoice_nip || null,
      email: order.invoice_email, // fallback mógłby być do maila z dostawy
      street: order.invoice_street,
      city: order.invoice_city,
      zip: order.invoice_zip,
      country: order.invoice_country || "Polska",
    };

    const contractorId = await upsertContractor(billing);

    // helper: normalizacja jednostki (usuń kropkę, spacje)
    const normalizeUnit = (u) =>
      String(u || "szt")
        .trim()
        .replace(/\.$/, "");

    const itemsForDoc = items.map((it) => {
      const perUnit = Number(it.per_unit) || 1; // np. 0.7 kg lub 8 szt
      const totalUnits = Number(it.qty) * perUnit; // np. 2 * 0.7 = 1.4 kg
      const unitPrice =
        (Number(it.price_brut) || 0) / (Number(it.per_unit) || 1);
      return {
        name: it.name,
        unit: normalizeUnit(it.unit), // "szt" / "kg"
        qtyPacks: it.qty, // ile opakowań (gdyby kiedyś potrzebne)
        perUnit, // rozmiar opakowania
        totalUnits, // <── to pójdzie w count
        priceBrut: unitPrice, // <── cena za 1 kg / 1 szt
        vatRate: it.vat_rate,
      };
    });

    const { id: wfirmaId, number } = await createDocument({
      contractorId,
      order: {
        isPaid: true, // bo sprawdzasz pay.status === 'ok'
        paymentMethod: pay.provider, // 'przelewy24' | 'bank_transfer' | 'cod'
        deliveryMethod: shipping?.method, // 'pickup' | 'inpost' | 'courier' | ...
        items: itemsForDoc, // <── UŻYJ nowej tablicy
        shippingCost: shipping ? Number(shipping.cost) : 0,
        shippingVatRate: SHIPPING_VAT_DEFAULT,
      },
    });

    await conn.query(
      "INSERT INTO invoices (order_id, wfirma_invoice_id, wfirma_number, issue_date) VALUES (?, ?, ?, CURDATE())",
      [orderId, wfirmaId, number]
    );

    // --- PDF + e-mail do klienta (best effort) ---
    try {
      const pdf = await getDocumentPdf(wfirmaId); // Buffer
      const { sendInvoiceIssuedEmail } = require("../services/emailService");
      // preferuj mail z sekcji fakturowej, w razie braku — z dostawy
      let targetEmail = order.invoice_email;
      if (!targetEmail) {
        const [[ship]] = await conn.query(
          "SELECT email FROM shipping_details WHERE order_id = ? LIMIT 1",
          [orderId]
        );
        targetEmail = ship?.email || null;
      }
      if (targetEmail) {
        await sendInvoiceIssuedEmail(targetEmail, {
          orderId,
          orderNumber: order.order_number,
          invoiceNumber: number,
          pdfBuf: pdf,
          isProforma:
            String(process.env.WFIRMA_MODE || "proforma").toLowerCase() !==
            "normal",
        });
      } else {
        console.warn("[invoice mail] brak adresu e-mail dla order", orderId);
      }
    } catch (mailErr) {
      console.error("[invoice mail] wysyłka nieudana:", mailErr);
      // nie przerywamy — faktura już została utworzona
    }

    res.json({ ok: true, invoice: { wfirmaId, number } });
  } catch (e) {
    console.error("[invoices/create+send]", e);
    res.status(500).json({ ok: false, message: e.message });
  } finally {
    conn.release();
  }
});

// GET /api/invoices/:orderId/pdf  (admin lub właściciel)
router.get("/:orderId/pdf", protect, async (req, res) => {
  const { orderId } = req.params;
  const conn = await pool.getConnection();
  try {
    const [orders] = await conn.query("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);
    if (!orders.length) return res.status(404).end();
    const order = orders[0];

    const isAdmin = req.user?.role === "admin";
    if (!isAdmin && String(order.user_id) !== String(req.user.id)) {
      return res.status(403).end();
    }

    const [invs] = await conn.query(
      "SELECT * FROM invoices WHERE order_id = ?",
      [orderId]
    );
    if (!invs.length) return res.status(404).json({ message: "No invoice" });
    const inv = invs[0];

    const pdf = await getDocumentPdf(inv.wfirma_invoice_id); // Buffer

    const base = inv.wfirma_number || `invoice-${order.order_number}`;
    const safe = String(base).replace(/[^\w\-\.]/g, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safe}.pdf"; filename*=UTF-8''${encodeURIComponent(
        safe
      )}.pdf`
    );
    res.setHeader("Content-Length", Buffer.byteLength(pdf)); // <—
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    res.end(pdf); // <— zamiast res.send()
  } catch (e) {
    console.error("[invoices/pdf]", e);
    res.status(500).json({ ok: false, message: e.message });
  } finally {
    conn.release();
  }
});

// GET /api/invoices?limit=2  – lista faktur zalogowanego użytkownika
router.get("/", protect, async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT i.id, i.order_id, i.wfirma_number, i.issue_date
         FROM invoices i
         JOIN orders o ON o.id = i.order_id
        WHERE o.user_id = ?
        ORDER BY i.issue_date DESC
        LIMIT ?`,
      [req.user.id, limit + 1] // +1 żeby sprawdzić czy jest „więcej”
    );

    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;

    res.json({ invoices: slice, hasMore });
  } catch (e) {
    console.error("[invoices/list]", e);
    res.status(500).json({ ok: false, message: e.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
