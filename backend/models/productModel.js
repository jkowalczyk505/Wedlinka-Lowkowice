const db = require("../config/db");

const ProductModel = {
  async create(product) {
    const {
      name,
      category,
      slug,
      description,
      ingredients,
      allergens,
      unit,
      quantity,
      price_net,
      vat_rate,
      image,
    } = product;

    const [result] = await db.query(
      `INSERT INTO products 
        (name, category, slug, description, ingredients, allergens, unit, quantity, price_net, vat_rate, image, is_available, is_deleted, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())`,
      [
        name,
        category,
        slug,
        description,
        ingredients,
        allergens,
        unit,
        quantity,
        price_net,
        vat_rate,
        image,
      ]
    );

    return { id: result.insertId, ...product };
  },

  async findAll() {
    const [rows] = await db.query(
      `SELECT * FROM products WHERE is_deleted = 0`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM products WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    return rows[0] || null;
  },

  async updateById(id, updatedProduct) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updatedProduct)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    values.push(id);

    await db.query(
      `UPDATE products SET ${fields.join(
        ", "
      )}, updated_at = NOW() WHERE id = ?`,
      values
    );
  },

  async softDeleteById(id) {
    await db.query(
      `UPDATE products SET is_deleted = 1, updated_at = NOW() WHERE id = ?`,
      [id]
    );
  },

  async updateAvailability(id, isAvailable) {
    await db.query(
      `UPDATE products SET is_available = ?, updated_at = NOW() WHERE id = ?`,
      [isAvailable, id]
    );
  },
};

module.exports = ProductModel;
