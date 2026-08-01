function validateRegister(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Datos de registro inválidos'] };
  }

  const nombre = data.nombre?.trim();
  const email = data.email?.trim();
  const usuario = data.usuario?.trim();
  const contraseña = data.contraseña;
  const confirmacion = data.confirmacion ?? data.confirmPassword ?? data.confirmarContraseña;

  if (!nombre) {
    errors.push('El nombre es obligatorio');
  }

  if (!email) {
    errors.push('El correo es obligatorio');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('El correo no tiene un formato válido');
  }

  if (!usuario) {
    errors.push('El usuario es obligatorio');
  }

  if (!contraseña) {
    errors.push('La contraseña es obligatoria');
  } else if (contraseña.length < 6) {
    errors.push('La contraseña debe tener mínimo 6 caracteres');
  }

  if (!confirmacion) {
    errors.push('La confirmación de contraseña es obligatoria');
  } else if (contraseña && confirmacion !== contraseña) {
    errors.push('La confirmación no coincide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateLogin(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Datos de login inválidos'] };
  }

  if (!data.usuario?.trim()) {
    errors.push('El usuario es obligatorio');
  }

  if (!data.contraseña) {
    errors.push('La contraseña es obligatoria');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateRegister,
  validateLogin
};
