// src/models/reviewModel.js
const db = require("../config/db");

const ReviewModel = {

  /** Średnia + liczba opinii dla produktu */
  async getStatsByProductId(productId) {
    const [rows] = await db.query(
      `SELECT AVG(rating)  AS avg,
              COUNT(*)     AS total
         FROM reviews
        WHERE product_id = ?`,
      [productId]
    );
    return {
      avg:   parseFloat(rows[0].avg)   || 0,
      total: rows[0].total             || 0,
    };
  },

  /** Zwraca wszystkie opinie danego produktu (najpierw najnowsze) */
  async findAllByProduct(productId) {
    const [rows] = await db.query(
      `SELECT r.*, u.name AS userName
         FROM reviews r
         JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC`,
      [productId]
    );
    return rows;
  },

  /**
   * Zwraca wszystkie opinie z informacją o produkcie i użytkowniku
   */
  async findAllWithProduct() {
  const [rows] = await db.query(
    `SELECT
       r.id,
       r.user_id,
       u.name      AS userName,
       r.product_id,
       p.name      AS productName,
       p.quantity  AS productQuantity,
       p.unit      AS productUnit,
       r.rating,
       r.comment,
       r.created_at
     FROM reviews r
     JOIN users    u ON u.id = r.user_id
     JOIN products p ON p.id = r.product_id
     ORDER BY r.created_at DESC`     /* ← sortowanie od najnowszych */
  );
  return rows;
},

  /** Pobiera jedną opinię po id */
  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM reviews WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async hardDeleteByProductId(productId, conn = db) {
    const [res] = await conn.query(
      'DELETE FROM reviews WHERE product_id = ?',
      [productId]
    );
    return res.affectedRows;        // zwraca ile wierszy skasowano
  },

  /** Czy użytkownik już ocenił produkt? */
  async findByUserAndProduct(userId, productId) {
    const [rows] = await db.query(
      `SELECT * FROM reviews
        WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );
    return rows[0] || null;
  },

  async create({ user_id, product_id, rating, comment }) {
    const [result] = await db.query(
      `INSERT INTO reviews (user_id, product_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [user_id, product_id, rating, comment]
    );
    return { id: result.insertId, user_id, product_id, rating, comment };
  },

  async updateById(id, { rating, comment }) {
    await db.query(
      `UPDATE reviews
          SET rating = ?, comment = ?, updated_at = NOW()
        WHERE id = ?`,
      [rating, comment, id]
    );
  },

  async deleteById(id) {
    await db.query(`DELETE FROM reviews WHERE id = ?`, [id]);
  },

  // Wyszukuje wszystkie opinie danego uzytkownika
  async findAllByUser(userId) {
    const [rows] = await db.query(
      `SELECT
          r.id, r.rating, r.comment, r.created_at,
          p.id      AS productId,
          p.name    AS productName,
          p.slug    AS productSlug,
          p.category,
          p.quantity AS productQuantity,
          p.unit     AS productUnit
      FROM reviews r
      JOIN products p ON p.id = r.product_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  },
};

module.exports = ReviewModel;
