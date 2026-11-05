function validateLogin(req, res, next) {
  const { correo, email, identificador, usuario, contraseña } = req.body;
  const targetEmail = correo || email || identificador || usuario;

  if (!targetEmail || typeof targetEmail !== 'string' || targetEmail.trim() === '') {
    const error = new Error('El correo o usuario identificador es obligatorio');
    error.statusCode = 400;
    return next(error);
  }

  if (!contraseña || typeof contraseña !== 'string' || contraseña === '') {
    const error = new Error('La contraseña es obligatoria');
    error.statusCode = 400;
    return next(error);
  }

  req.body = {
    email: targetEmail.trim().toLowerCase(),
    contraseña
  };

  next();
}

module.exports = {
  validateLogin
};