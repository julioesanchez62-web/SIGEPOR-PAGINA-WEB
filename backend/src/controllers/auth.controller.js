// src/controllers/auth.controller.js
const login = async (req, res, next) => {
  try {
    // Lógica temporal de prueba
    res.json({ message: 'Endpoint de login listo' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login
};