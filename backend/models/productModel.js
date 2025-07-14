const db = require("../config/db");

function buildOrderClause(sortBy) {
  switch (sortBy) {
    case "price_asc":
      return "ORDER BY price_brut ASC";
    case "price_desc":
      return "ORDER BY price_brut DESC";
    case "name_asc":
      return "ORDER BY name ASC";
    case "name_desc":
      return "ORDER BY name DESC";
    case "date_asc":
      return "ORDER BY created_at ASC";
    case "date_desc":
    default:
      return "ORDER BY created_at DESC";
  }
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
      price_brut,
      vat_rate,
      image,
    } = product;

    if (vat_rate === undefined || vat_rate === null || vat_rate === "") {
      vat_rate = 0.05;
    }

    const [result] = await db.query(
      `INSERT INTO products 
        (name, category, slug, description, ingredients, allergens, unit, quantity, price_brut, vat_rate, image)
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
        price_brut,
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

  async findAllSorted(sortBy = "date_desc") {
    const order = buildOrderClause(sortBy);
    const [rows] = await db.query(
      `SELECT * FROM products WHERE is_deleted = 0 ${order}`
    );
    return rows;
  },

  async findBySlug(slug) {
    const [rows] = await db.query(
      `SELECT * FROM products WHERE slug = ? AND is_deleted = 0`,
      [slug]
    );
    return rows[0] || null;
  },

  async findByCategory(category) {
    const [rows] = await db.query(
      "SELECT * FROM products WHERE category = ? AND is_deleted = 0",
      [category]
    );
    return rows;
  },

  async findByCategorySorted(category, sortBy = "date_desc") {
    const order = buildOrderClause(sortBy);
    const [rows] = await db.query(
      `SELECT * FROM products WHERE category = ? AND is_deleted = 0 ${order}`,
      [category]
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
