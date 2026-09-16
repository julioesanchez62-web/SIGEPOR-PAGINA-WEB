/**
 * Middleware de Autenticación JWT y Control de Acceso por Roles (RBAC)
 * SIGEPOR
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sigepor_secret_key_2026_production';

// Mapeo de Roles del sistema
const ROLES = {
  1: 'Administrador',
  2: 'Empleado',
  3: 'Veterinario',
  4: 'Cliente'
};

/**
 * Verificar token JWT de la solicitud
 */
function verifyToken(req, res, next) {
  // Las rutas públicas como /login o /health no requieren este middleware en la definición de la ruta
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (typeof authHeader === 'string') {
    token = authHeader;
  }

  // Si no se proporciona token, rechazar acceso
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Acceso denegado. Se requiere un token de autenticación.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      ...decoded,
      rolNombre: ROLES[decoded.idRol] || 'Usuario'
    };
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token de sesión inválido o expirado. Por favor, inicie sesión nuevamente.'
    });
  }
}

/**
 * Middleware para requerir roles específicos (RBAC)
 * @param {Array<number|string>} allowedRoles Lista de IDs o Nombres de rol permitidos
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !req.user.idRol) {
      return res.status(401).json({
        status: 'fail',
        message: 'Acceso no autorizado. Debe autenticarse primero.'
      });
    }

    const userRolId = Number(req.user.idRol);
    const userRolNombre = req.user.rolNombre;

    const hasPermission = allowedRoles.some(role => {
      if (typeof role === 'number') return role === userRolId;
      if (typeof role === 'string') return role.toLowerCase() === (userRolNombre || '').toLowerCase();
      return false;
    });

    if (!hasPermission) {
      return res.status(403).json({
        status: 'fail',
        message: `Acceso restringido. Su rol actual (${userRolNombre || 'Sin rol'}) no tiene permisos para esta acción.`
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  requireRole,
  ROLES,
  JWT_SECRET
};