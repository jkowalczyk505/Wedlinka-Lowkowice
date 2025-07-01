// config/db.js
const mysql = require("mysql2/promise");

// Tworzymy pulę połączeń
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test połączenia od razu przy pierwszym require()
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Połączono z bazą danych");
    conn.release();
  } catch (err) {
    console.error("❌ Błąd połączenia z bazą danych:", err.message);
    process.exit(1);
  }
})();

module.exports = pool;
