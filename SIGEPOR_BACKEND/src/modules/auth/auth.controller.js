const authService = require('./auth.service');

async function login(req, res, next) {
  try {
    const { email, contraseña } = req.body;
    const result = await authService.login(email, contraseña);
    
    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login
};