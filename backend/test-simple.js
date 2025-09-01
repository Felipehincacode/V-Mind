// ===== PRUEBA SIMPLE DEL SISTEMA COMPLETO =====

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { pool } = require('./config/database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Función simple para generar token
const generateToken = (userId) => {
  return jwt.sign({ userId }, 'secret', { expiresIn: '24h' });
};

// Ruta de login simple
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // Comparar contraseña simple
    if (user.passwords !== password) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // Generar token
    const token = generateToken(user.user_id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          user_id: user.user_id,
          user_name: user.user_name,
          email: user.email,
          username: user.username,
          rol: user.rol
        },
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el login'
    });
  }
});

// Ruta de registro simple
app.post('/api/auth/register', async (req, res) => {
  try {
    const { user_name, email, username, password } = req.body;
    
    if (!user_name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const [existingRows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Crear usuario
    const [result] = await pool.execute(
      'INSERT INTO users (user_id, user_name, username, email, passwords, rol) VALUES (UUID(), ?, ?, ?, ?, ?)',
      [user_name, username, email, password, 'user']
    );

    const newUser = {
      user_id: result.insertId,
      user_name,
      email,
      username,
      rol: 'user'
    };

    const token = generateToken(newUser.user_id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario'
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba iniciado en http://localhost:${PORT}`);
  console.log(`📝 Login: POST /api/auth/login`);
  console.log(`📝 Registro: POST /api/auth/register`);
});
