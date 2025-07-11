const db = require("../config/db");

const CartModel = {
  async getItems(userId) {
    const [rows] = await db.query(
      `SELECT ci.*, p.name, p.price_net, p.unit, p.image
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`,
      [userId]
    );
    return rows;
  },

  async addItem(userId, productId, quantity = 1) {
    // Jeśli już istnieje — zaktualizuj
    const [existing] = await db.query(
      "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE cart_items
         SET quantity = quantity + ?, updated_at = NOW()
         WHERE user_id = ? AND product_id = ?`,
        [quantity, userId, productId]
      );
    } else {
      await db.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES (?, ?, ?)`,
        [userId, productId, quantity]
      );
    }
  },

  async updateQuantity(userId, productId, quantity) {
    await db.query(
      `UPDATE cart_items SET quantity = ?, updated_at = NOW()
       WHERE user_id = ? AND product_id = ?`,
      [quantity, userId, productId]
    );
  },

  async removeItem(userId, productId) {
    await db.query(
      `DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );
  },

  async clearCart(userId) {
    await db.query(`DELETE FROM cart_items WHERE user_id = ?`, [userId]);
  },
};

module.exports = CartModel;
