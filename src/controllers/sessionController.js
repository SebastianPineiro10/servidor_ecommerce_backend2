import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Controlador para el registro
export const register = async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      role: req.body.role || 'user'
    });

    await newUser.save();
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      redirect: '/login', // Redirige al login después del registro
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para el login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, 'miClaveSecreta', { expiresIn: '1h' });

    // Guardar el token como cookie
    res.cookie('token', token, {
      httpOnly: true, // Aumenta la seguridad de la cookie
      secure: false, // Cambiar a true si usas HTTPS
      maxAge: 3600000 // 1 hora
    });

    // Devolver datos del usuario y mensaje de éxito
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
      },
      redirect: '/user-details', // Redirige a los detalles del usuario
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para el current
export const current = async (req, res) => {
  try {
    const token = req.cookies?.token; // Extraer el token desde las cookies
    if (!token) {
      return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
    }

    const decoded = jwt.verify(token, 'miClaveSecreta'); // Verificar y decodificar el token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.status(200).json({
      status: 'success',
      payload: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

