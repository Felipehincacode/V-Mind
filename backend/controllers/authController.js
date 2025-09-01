const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

const register = async (req, res) => {
  try {
    const { user_name, email, username, phone, passwords, objetive, preferred_language } = req.body;

    // Validate required fields
    if (!user_name || !email || !username || !passwords) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, username and password are required'
      });
    }

    // Check if user already exists by email
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if user already exists by username
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Create new user
    const userData = {
      user_name,
      email,
      username,
      phone,
      passwords: password, // Mapear password a passwords para la base de datos
      objetive,
      preferred_language: preferred_language || 'es'
    };

    const newUser = await User.create(userData);
    const token = generateToken(newUser.userId);
    const refreshToken = require('crypto').randomBytes(64).toString('hex');

    // Save refresh token to database
    const { pool } = require('../config/database');
    await pool.execute(
      'UPDATE users SET refresh_token = ? WHERE user_id = ?',
      [refreshToken, newUser.userId]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          user_id: newUser.userId,
          user_name: newUser.user_name,
          email: newUser.email,
          rol: newUser.rol
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, passwords } = req.body;

    // Validate required fields
    if (!email || !passwords) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await User.comparePassword(passwords, user.passwords);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last connection
    await User.updateLastConnection(user.user_id);

    // Generate token and refresh token
    const token = generateToken(user.user_id);
    const refreshToken = require('crypto').randomBytes(64).toString('hex');

    // Save refresh token to database
    const { pool } = require('../config/database');
    await pool.execute(
      'UPDATE users SET refresh_token = ? WHERE user_id = ?',
      [refreshToken, user.user_id]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          user_id: user.user_id,
          user_name: user.user_name,
          email: user.email,
          rol: user.rol,
          current_level: user.current_level,
          objetive: user.objetive
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          user_id: user.user_id,
          user_name: user.user_name,
          email: user.email,
          phone: user.phone,
          rol: user.rol,
          objetive: user.objetive,
          current_level: user.current_level,
          preferred_language: user.preferred_language,
          creation_date: user.creation_date,
          last_connection: user.last_connection
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user profile',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { user_name, phone, objetive, preferred_language } = req.body;
    
    const updateData = {};
    if (user_name) updateData.user_name = user_name;
    if (phone) updateData.phone = phone;
    if (objetive) updateData.objetive = objetive;
    if (preferred_language) updateData.preferred_language = preferred_language;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const query = `
      UPDATE users 
      SET ${Object.keys(updateData).map(key => `${key} = ?`).join(', ')}
      WHERE user_id = ?
    `;
    
    const values = [...Object.values(updateData), req.user.user_id];
    
    const { pool } = require('../config/database');
    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updateData
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verificar si el refresh token existe en la base de datos
    const { pool } = require('../config/database');
    const [rows] = await pool.execute(
      'SELECT user_id, user_name, email, rol FROM users WHERE refresh_token = ?',
      [refreshToken]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const user = rows[0];

    // Generar nuevo token y refresh token
    const newToken = generateToken(user.user_id);
    const newRefreshToken = require('crypto').randomBytes(64).toString('hex');

    // Actualizar el refresh token en la base de datos
    await pool.execute(
      'UPDATE users SET refresh_token = ? WHERE user_id = ?',
      [newRefreshToken, user.user_id]
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          user_id: user.user_id,
          user_name: user.user_name,
          email: user.email,
          rol: user.rol
        }
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing token',
      error: error.message
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Limpiar el refresh token de la base de datos
      const { pool } = require('../config/database');
      await pool.execute(
        'UPDATE users SET refresh_token = NULL WHERE refresh_token = ?',
        [refreshToken]
      );
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  refreshToken,
  logout
};
