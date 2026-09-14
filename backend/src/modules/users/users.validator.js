/**
 * Validaciones del módulo de usuarios
 * 
 * RESPONSABILIDAD:
 * - Validar formato y estructura de datos recibidos del cliente
 * - Verificar tipos de datos (string, number, email, etc.)
 * - Validar longitudes, rangos, patrones (regex)
 * - Normalizar datos (trim, lowercase, conversión de tipos)
 * - NO acceder a la base de datos
 * - NO aplicar reglas de negocio complejas (ej: ¿existe ese correo?)
 * - Retornar errores 400 si la validación falla
 * 
 * NOTA: Las validaciones de negocio (ej: "¿existe ese correo?") van en SERVICE
 * 
 * FLUJO:
 * Datos brutos → Normalizar → Validar → OK (next()) o Error 400 (next(error))
 */

/**
 * Regex para validar formato de email
 * Patrón simple pero efectivo:
 * - Caracteres antes de @
 * - @ obligatorio
 * - Dominio y extensión válida
 * 
 * Ejemplos válidos:
 * - user@example.com ✅
 * - juan.perez@empresa.co ✅
 * - admin+tag@domain.org ✅
 * 
 * Ejemplos inválidos:
 * - user@.com ❌
 * - @example.com ❌
 * - user.example.com ❌ (falta @)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validar datos para crear usuario
 * 
 * Middleware de Express que:
 * 1. Extrae datos de req.body
 * 2. Normaliza (trim, toLowerCase, conversión de tipos)
 * 3. Valida cada campo
 * 4. Si hay error → next(error) con statusCode 400
 * 5. Si OK → Reemplaza req.body con datos normalizados y next()
 * 
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
function validateCreateUser(req, res, next) {
  try {
    // Extraer datos del body
    const { nombre, correo, contraseña, idRol } = req.body;

    // ─────────────────────────────────────────────────────────────
    // 1️⃣ VALIDAR NOMBRE
    // ─────────────────────────────────────────────────────────────

    // Verificar que nombre existe y no está vacío (después de trim)
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      const error = new Error('El nombre es obligatorio');
      error.statusCode = 400;
      return next(error);
    }

    // Normalizar nombre (eliminar espacios al inicio/final)
    const nombreNormalizado = nombre.trim();

    // Verificar longitud máxima
    if (nombreNormalizado.length > 100) {
      const error = new Error('El nombre no puede exceder 100 caracteres');
      error.statusCode = 400;
      return next(error);
    }

    // ─────────────────────────────────────────────────────────────
    // 2️⃣ VALIDAR CORREO
    // ─────────────────────────────────────────────────────────────

    // Verificar que correo existe y no está vacío
    if (!correo || typeof correo !== 'string' || correo.trim() === '') {
      const error = new Error('El correo es obligatorio');
      error.statusCode = 400;
      return next(error);
    }

    // Normalizar correo (trim + lowercase para uniformidad)
    const correoNormalizado = correo.trim().toLowerCase();

    // Verificar formato válido (usar regex)
    if (!EMAIL_REGEX.test(correoNormalizado)) {
      const error = new Error('El correo no tiene formato válido');
      error.statusCode = 400;
      return next(error);
    }

    // Verificar longitud máxima
    if (correoNormalizado.length > 150) {
      const error = new Error('El correo no puede exceder 150 caracteres');
      error.statusCode = 400;
      return next(error);
    }

    // ─────────────────────────────────────────────────────────────
    // 3️⃣ VALIDAR CONTRASEÑA
    // ─────────────────────────────────────────────────────────────

    // Verificar que contraseña existe y no está vacía
    if (!contraseña || typeof contraseña !== 'string' || contraseña === '') {
      const error = new Error('La contraseña es obligatoria');
      error.statusCode = 400;
      return next(error);
    }

    // Verificar mínimo de caracteres (6)
    if (contraseña.length < 6) {
      const error = new Error('La contraseña debe tener mínimo 6 caracteres');
      error.statusCode = 400;
      return next(error);
    }

    // ─────────────────────────────────────────────────────────────
    // 4️⃣ VALIDAR ID DEL ROL
    // ─────────────────────────────────────────────────────────────

    // Verificar que idRol existe
    if (idRol === undefined || idRol === null || idRol === '') {
      const error = new Error('El ID del rol es obligatorio');
      error.statusCode = 400;
      return next(error);
    }

    // Convertir a número
    const idRolNumero = Number(idRol);

    // Verificar que es un número válido (no NaN)
    if (isNaN(idRolNumero)) {
      const error = new Error('El ID del rol debe ser un número');
      error.statusCode = 400;
      return next(error);
    }

    // Verificar que es entero (sin decimales)
    if (!Number.isInteger(idRolNumero)) {
      const error = new Error('El ID del rol debe ser un número entero');
      error.statusCode = 400;
      return next(error);
    }

    // Verificar que es positivo (> 0)
    if (idRolNumero <= 0) {
      const error = new Error('El ID del rol debe ser un número positivo');
      error.statusCode = 400;
      return next(error);
    }

    // ─────────────────────────────────────────────────────────────
    // ✅ TODAS LAS VALIDACIONES PASARON
    // ─────────────────────────────────────────────────────────────
    // Mapear "correo" a "email" para mantener consistencia con el repositorio
    req.body = {
      nombre: nombreNormalizado,
      correo: correoNormalizado,
      email: correoNormalizado, // 👈 Se agrega para compatibilidad con el Repository
      contraseña,
      idRol: idRolNumero
    };

    next();

  } catch (error) {
    // Si hay error no capturado en validaciones, retornar 400
    error.statusCode = 400;
    next(error);
  }
}

module.exports = {
  validateCreateUser
};
