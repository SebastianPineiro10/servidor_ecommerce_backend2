// auth/jwt.js
const jwt = require('jsonwebtoken');
const secretKey = 'miClaveSecreta'; // Asegúrate de cambiar esto por una clave secreta segura y guardarla en un archivo .env

function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: '24h' }); // Expira en 24 horas
}

function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey); // Verificación del token
  } catch (error) {
    return null; // Si el token no es válido o expiró
  }
}

module.exports = { generateToken, verifyToken };
