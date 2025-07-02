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
        WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT id, email, name, surname, phone, role, created_at AS createdAt, updated_at AS updatedAt
         FROM users
        WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findPublicById(id) {
    const [rows] = await db.query(
      `SELECT id, name, surname FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async updateById(id, { name, surname, phone }) {
    await db.query(
      `UPDATE users 
          SET name = ?, surname = ?, phone = ?, updated_at = NOW()
        WHERE id = ?`,
      [name, surname, phone, id]
    );
  },

  async findByIdWithPassword(id) {
    const [rows] = await db.query(
      `SELECT id, email, password_hash AS passwordHash, name, surname, phone, role
         FROM users
        WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async updatePassword(id, newHash) {
    await db.query(
      `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
      [newHash, id]
    );
  },

  async updateEmail(id, newEmail) {
    await db.query(
      `UPDATE users SET email = ?, updated_at = NOW() WHERE id = ?`,
      [newEmail, id]
    );
  },

  async deleteById(id) {
    await db.query(`DELETE FROM users WHERE id = ?`, [id]);
  },
};

module.exports = UserModel;
