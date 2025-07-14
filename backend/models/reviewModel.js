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
};

module.exports = ReviewModel;
