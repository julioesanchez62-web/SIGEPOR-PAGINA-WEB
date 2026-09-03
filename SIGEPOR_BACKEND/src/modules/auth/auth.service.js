const bcryptjs = require('bcryptjs');
const authRepository = require('./auth.repository');

async function login(email, contraseña) {
  const usuario = await authRepository.findUserByEmail(email);
  if (!usuario) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const passwordMatch = await bcryptjs.compare(contraseña, usuario.contraseña);
  if (!passwordMatch) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  // Se excluye el hash de la contraseña de la respuesta
  const { contraseña: _, ...userWithoutPassword } = usuario;
  
  return {
    user: userWithoutPassword
  };
}

module.exports = {
  login
};