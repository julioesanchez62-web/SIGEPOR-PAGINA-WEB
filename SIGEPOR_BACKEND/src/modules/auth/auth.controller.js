const authService = require('./auth.service');

async function login(req, res) {
  // 1. Extraemos las propiedades asegurando que coincidan con tu frontend (correo o email)
  const { correo, email, contraseña, registerPassword } = req.body;
  
  // Mapeo flexible por si el frontend envía 'correo' o 'email'
  const userEmail = email || correo;
  // Mapeo flexible por si el frontend envía 'contraseña' o 'registerPassword'
  const userPassword = contraseña || registerPassword;

  try {
    // VALIDACIÓN CRÍTICA: Se añade 'await' para detener el flujo si el servicio lanza el error 401
    const result = await authService.login(userEmail, userPassword);

    // Si el servicio no lanzó error, la autenticación es totalmente válida
    return res.status(200).json({
      mensaje: '¡Login exitoso!',
      user: result.user
    });

  } catch (error) {
    console.error('Error detectado en el login controlador:', error.message);
    
    // Si el error viene del servicio con un código de estado (como el 401)
    const statusCode = error.statusCode || 500;
    const mensaje = statusCode === 401 ? 'Correo o contraseña incorrectos' : 'Error interno del servidor';
    
    return res.status(statusCode).json({ mensaje });
  }
}

module.exports = {
  login
};
