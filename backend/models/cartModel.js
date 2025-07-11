const db = require("../config/db");

const CartModel = {
  /* ------------------------------------------------------------------ *
   *  ZWROT LISTY POZYCJI                                               *
   *  - zwracamy również flagi is_available / is_deleted,               *
   *    aby front-end mógł je wyświetlić lub odfiltrować                *
   * ------------------------------------------------------------------ */
  async getItems(userId) {
    const [rows] = await db.query(
      `SELECT  ci.*,
               p.name,
               p.price_net,
               p.unit,
               p.image,
               p.slug,
               p.category,
               p.is_available,
               p.is_deleted
         FROM  cart_items ci
   LEFT JOIN  products p ON p.id = ci.product_id
        WHERE  ci.user_id = ?`,
      [userId]
    );
    return rows;
  },

  /* ------------------------------------------------------------------ *
   *  PURGE – czyścimy wiersze odnoszące się do produktów usuniętych    *
   *  albo wyłączonych. Zwraca liczbę skasowanych pozycji.              *
   * ------------------------------------------------------------------ */
  async purgeInvalid(userId) {
    const [result] = await db.query(
      `DELETE  ci
         FROM  cart_items ci
   LEFT JOIN  products p ON p.id = ci.product_id
        WHERE  ci.user_id = ?
          AND (p.id IS NULL OR p.is_deleted = 1 OR p.is_available = 0)`,
      [userId]
    );
    return result.affectedRows; // ← ile rekordów usunięto
  },

  /* ------------------------------------------------------------------ *
   *  DODAWANIE / ZWIĘKSZANIE ILOŚCI                                    *
   * ------------------------------------------------------------------ */
  async addItem(userId, productId, quantity = 1) {
    const [existing] = await db.query(
      `SELECT 1 FROM cart_items
        WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );

    if (existing.length) {
      await db.query(
        `UPDATE cart_items
            SET quantity   = quantity + ?,
                updated_at = NOW()
          WHERE user_id    = ? AND product_id = ?`,
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

  /* ------------------------------------------------------------------ *
   *  AKTUALIZACJA ILOŚCI (0 → usunięcie)                               *
   * ------------------------------------------------------------------ */
  async updateQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      await this.removeItem(userId, productId);
      return;
    }

    await db.query(
      `UPDATE cart_items
          SET quantity   = ?,
              updated_at = NOW()
        WHERE user_id    = ? AND product_id = ?`,
      [quantity, userId, productId]
    );
  },

  /* ------------------------------------------------------------------ *
   *  USUNIĘCIE POJEDYNCZEJ POZYCJI                                      *
   * ------------------------------------------------------------------ */
  async removeItem(userId, productId) {
    await db.query(
      `DELETE FROM cart_items
        WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );
  },

  /* ------------------------------------------------------------------ *
   *  CZYSZCZENIE CAŁEGO KOSZYKA                                        *
   * ------------------------------------------------------------------ */
  async clearCart(userId) {
    await db.query(`DELETE FROM cart_items WHERE user_id = ?`, [userId]);
  },
};

module.exports = CartModel;
