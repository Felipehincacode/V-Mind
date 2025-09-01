const { pool } = require('../config/database');

class User {
  static async create(userData) {
    const query = `
      INSERT INTO users (user_id, user_name, username, email, passwords, rol)
      VALUES (UUID(), ?, ?, ?, ?, ?)
    `;
    
    const values = [
      userData.user_name,
      userData.username,
      userData.email,
      userData.passwords, // Contraseña en texto plano para MVP
      userData.rol || 'user'
    ];

    try {
      const [result] = await pool.execute(query, values);
      return { userId: result.insertId, ...userData };
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    
    try {
      const [rows] = await pool.execute(query, [email]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  static async findById(userId) {
    const query = 'SELECT * FROM users WHERE user_id = ?';
    
    try {
      const [rows] = await pool.execute(query, [userId]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }
}

module.exports = User;
