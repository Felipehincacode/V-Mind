const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.passwords, 10);
    
    const query = `
      INSERT INTO users (user_id, user_name, username, email, phone, passwords, rol, objetive, preferred_language)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      userId,
      userData.user_name,
      userData.username,
      userData.email,
      userData.phone || null,
      hashedPassword,
      userData.rol || 'user',
      userData.objetive || null,
      userData.preferred_language || 'es'
    ];

    try {
      const [result] = await pool.execute(query, values);
      return { userId, ...userData, passwords: undefined };
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

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ?';
    
    try {
      const [rows] = await pool.execute(query, [username]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
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

  static async updateLastConnection(userId) {
    const query = 'UPDATE users SET last_connection = NOW() WHERE user_id = ?';
    
    try {
      await pool.execute(query, [userId]);
    } catch (error) {
      throw new Error(`Error updating last connection: ${error.message}`);
    }
  }

  static async updateCurrentLevel(userId, level) {
    const query = 'UPDATE users SET current_level = ? WHERE user_id = ?';
    
    try {
      await pool.execute(query, [level, userId]);
    } catch (error) {
      throw new Error(`Error updating current level: ${error.message}`);
    }
  }

  static async getAllUsers() {
    const query = 'SELECT user_id, user_name, email, rol, creation_date, current_level FROM users';
    
    try {
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error getting all users: ${error.message}`);
    }
  }

  static async comparePassword(password, hashedPassword) {
    // Temporalmente permitir comparación directa para contraseñas en texto plano
    // TODO: Migrar todas las contraseñas a hash en producción
    if (hashedPassword === password) {
      return true;
    }
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;
