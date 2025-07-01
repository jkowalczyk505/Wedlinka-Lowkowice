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
};

module.exports = UserModel;
