const db = require("../config/db");

function formatDecimal(value) {
  if (value == null) return null;
  const num = parseFloat(value);
  return Number.isInteger(num) ? `${num}` : num.toLocaleString("pl-PL");
}

const ProductModel = {
  async create(product) {
    let {
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

    if (vat_rate === undefined || vat_rate === null || vat_rate === "") {
      vat_rate = 0.05;
    }

    const [result] = await db.query(
      `INSERT INTO products 
        (name, category, slug, description, ingredients, allergens, unit, quantity, price_net, vat_rate, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    return rows.map((row) => ({
      ...row,
      quantity: formatDecimal(row.quantity),
      price_net: formatDecimal(row.price_net),
    }));
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM products WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    const row = rows[0];
    return row
      ? {
          ...row,
          quantity: formatDecimal(row.quantity),
          price_net: formatDecimal(row.price_net),
        }
      : null;
  },

  async findByCategory(category) {
    const [rows] = await db.query(
      "SELECT * FROM products WHERE category = ? AND is_deleted = 0",
      [category]
    );
    return rows.map((row) => ({
      ...row,
      quantity: formatDecimal(row.quantity),
      price_net: formatDecimal(row.price_net),
    }));
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
      `UPDATE products 
     SET is_deleted = 1, is_available = 0, updated_at = NOW() 
     WHERE id = ?`,
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
