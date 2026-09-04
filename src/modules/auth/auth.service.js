const authRepository = require('./auth.repository');

async function login(email, contraseña) {
  // 1. Buscamos al usuario en MySQL usando el repositorio
  const usuario = await authRepository.findUserByEmail(email);
  
  if (!usuario) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  // 2. OBTENER LA CONTRASEÑA DE MYSQL (Mapeo flexible de columnas comunes)
  // Tu servicio de usuarios utiliza 'usuario.contraseña', aseguramos capturar esa propiedad
  const contrasenaBD = usuario.contraseña || usuario.contrasena || usuario.password;

  // 3. COMPARACIÓN EN TEXTO PLANO (Igual que en tu users.service.js)
  const passwordMatch = (contraseña === contrasenaBD);
  
  if (!passwordMatch) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  // 4. Excluimos los campos de contraseña del objeto de respuesta por seguridad
  const { contraseña: _, contrasena: __, password: ___, ...userWithoutPassword } = usuario;
  
  return {
    user: userWithoutPassword
  };
}

module.exports = {
  login
};
