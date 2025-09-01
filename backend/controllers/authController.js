const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '24h'
  });
};

const register = async (req, res) => {
  try {
    const { user_name, email, username, password } = req.body;

    // Validación simple
    if (!user_name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Crear usuario simple (sin hash por ahora)
    const userData = {
      user_name,
      email,
      username,
      passwords: password, // Guardar contraseña en texto plano para MVP
      rol: 'user'
    };

    const newUser = await User.create(userData);
    const token = generateToken(newUser.userId);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          user_id: newUser.userId,
          user_name: newUser.user_name,
          email: newUser.email,
          username: newUser.username,
          rol: newUser.rol
        },
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
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación simple
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // Comparar contraseña simple (sin hash para MVP)
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
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          user_id: user.user_id,
          user_name: user.user_name,
          email: user.email,
          username: user.username,
          rol: user.rol
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
