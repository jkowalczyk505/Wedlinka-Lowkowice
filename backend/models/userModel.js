// models/userModel.js
const db = require("../config/db");

const UserModel = {
  async create({
    email,
    passwordHash,
    name,
    surname,
    phone,
    role = "customer",
  }) {
    const [result] = await db.query(
      `INSERT INTO users 
       (email, password_hash, name, surname, phone, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [email, passwordHash, name, surname, phone, role]
    );
    return { id: result.insertId, email, name, surname, phone, role };
  },

  async findByEmail(email) {
    const [rows] = await db.query(
      `SELECT id, email, password_hash AS passwordHash, name, surname, phone, role 
         FROM users 
        WHERE email = ? AND is_deleted = 0`,
      [email]
    );
    return rows[0] || null;
  },

  async existsAnyEmail(email) {
    const [rows] = await db.query(
      `SELECT id FROM users WHERE email = ? AND is_deleted = 0`,
      [email]
    );
    return rows.length > 0;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT id, email, name, surname, phone, role,
          street, apartment_number AS apartmentNumber,
          postal_code AS postalCode, city,
          created_at AS createdAt, updated_at AS updatedAt
   FROM users
   WHERE id = ? AND is_deleted = 0`,
      [id]
    );

    return rows[0] || null;
  },

  async findPublicById(id) {
    const [rows] = await db.query(
      `SELECT id, name, surname FROM users WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    return rows[0] || null;
  },

  async updateById(id, { name, surname, phone }) {
    await db.query(
      `UPDATE users 
          SET name = ?, surname = ?, phone = ?, updated_at = NOW()
        WHERE id = ? AND is_deleted = 0`,
      [name, surname, phone, id]
    );
  },

  async updateAddress(id, { street, apartmentNumber, postalCode, city }) {
    await db.query(
      `UPDATE users SET 
       street = ?, 
       apartment_number = ?, 
       postal_code = ?, 
       city = ?, 
       updated_at = NOW()
     WHERE id = ? AND is_deleted = 0`,
      [street, apartmentNumber, postalCode, city, id]
    );
  },

  async findByIdWithPassword(id) {
    const [rows] = await db.query(
      `SELECT id, email, password_hash AS passwordHash, name, surname, phone, role
         FROM users
        WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    return rows[0] || null;
  },

  async updatePassword(id, newHash) {
    await db.query(
      `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ? AND is_deleted = 0`,
      [newHash, id]
    );
  },

  async updateEmail(id, newEmail) {
    await db.query(
      `UPDATE users SET email = ?, updated_at = NOW() WHERE id = ? AND is_deleted = 0`,
      [newEmail, id]
    );
  },

  async markAsDeleted(id) {
    await db.query(
      `UPDATE users 
     SET is_deleted = 1,
         email = CONCAT('anon_', id, '@deleted.local'),
         name = Użytkownik usunięty,
         surname = Użytkownik usunięty,
         phone = NULL,
         street = NULL,
         apartment_number = NULL,
         postal_code = NULL,
         city = NULL,
         updated_at = NOW()
     WHERE id = ?`,
      [id]
    );
  },
};

module.exports = UserModel;
