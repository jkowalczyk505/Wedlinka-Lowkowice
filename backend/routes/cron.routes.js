const express = require("express");
const mysql = require("mysql2/promise");

const router = express.Router();
const CRON_KEY = process.env.CRON_KEY;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
});

/**
 * POST /api/cron/cleanup?key=CRON_KEY[&dryRun=1]
 * dryRun=1 -> policzy, cofnie transakcję (nic nie usunie)
 */
router.post("/cleanup", async (req, res) => {
  const key = req.query.key || req.headers["x-cron-key"];
  const dryRun = String(req.query.dryRun || "") === "1";
  if (!CRON_KEY || key !== CRON_KEY) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // A) SHIPPING DETAILS > 6 mies. (po własnym created_at) → TWARDY DELETE
    const [aDel] = await conn.query(`
      DELETE FROM shipping_details
      WHERE created_at < (NOW() - INTERVAL 6 MONTH)
    `);

    // C) ANULOWANE > 90 dni (dzieci -> rodzic)
    const condCancelled = `
      o.status = 'cancelled'
      AND o.created_at < (NOW() - INTERVAL 90 DAY)
    `;

    const [c0] = await conn.query(
      `DELETE sd FROM shipping_details sd JOIN orders o ON o.id = sd.order_id WHERE ${condCancelled};`
    );
    const [c1] = await conn.query(
      `DELETE oi FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE ${condCancelled};`
    );
    const [c2] = await conn.query(
      `DELETE p  FROM payments p   JOIN orders o ON o.id = p.order_id  WHERE ${condCancelled};`
    );
    const [c3] = await conn.query(
      `DELETE i  FROM invoices i   JOIN orders o ON o.id = i.order_id  WHERE ${condCancelled};`
    );
    const [c4] = await conn.query(
      `DELETE o  FROM orders o WHERE ${condCancelled};`
    );

    // B) WSZYSTKO > 5 lat (dzieci -> rodzic)
    const cond5y = `o.created_at < (NOW() - INTERVAL 5 YEAR)`;

    const [b0] = await conn.query(
      `DELETE sd FROM shipping_details sd JOIN orders o ON o.id = sd.order_id WHERE ${cond5y};`
    );
    const [b1] = await conn.query(
      `DELETE oi FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE ${cond5y};`
    );
    const [b2] = await conn.query(
      `DELETE p  FROM payments p   JOIN orders o ON o.id = p.order_id  WHERE ${cond5y};`
    );
    const [b3] = await conn.query(
      `DELETE i  FROM invoices i   JOIN orders o ON o.id = i.order_id  WHERE ${cond5y};`
    );
    const [b4] = await conn.query(`DELETE o  FROM orders o WHERE ${cond5y};`);

    // D) password_resets – wygasłe
    const [rD] = await conn.query(`
      DELETE FROM password_resets
      WHERE (expires_at IS NOT NULL AND expires_at < NOW())
         OR (expires_at IS NULL AND created_at < (NOW() - INTERVAL 1 DAY))
    `);

    if (dryRun) await conn.rollback();
    else await conn.commit();

    res.json({
      ok: true,
      dryRun,
      results: {
        shippingDeleted6m: aDel.affectedRows,
        cancelled90d: {
          shipping_details: c0.affectedRows,
          order_items: c1.affectedRows,
          payments: c2.affectedRows,
          invoices: c3.affectedRows,
          orders: c4.affectedRows,
        },
        olderThan5y: {
          shipping_details: b0.affectedRows,
          order_items: b1.affectedRows,
          payments: b2.affectedRows,
          invoices: b3.affectedRows,
          orders: b4.affectedRows,
        },
        passwordResets: rD.affectedRows,
      },
    });
  } catch (e) {
    await conn.rollback();
    console.error("[CRON CLEANUP]", e);
    res.status(500).json({ ok: false, error: e.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
