/**
 * Middleware centralizado de manejo de errores
 * 
 * IMPORTANTE: Debe registrarse DESPUÉS de todas las rutas en app.js
 * Express lo identifica por tener 4 parámetros (err, req, res, next)
 * 
 * Flujo:
 * 1. Un controller llama next(error)
 * 2. Express salta directo a este middleware
 * 3. Formatea respuesta JSON y registra en logs
 * 
 * Regla de códigos de estado:
 * - 4xx: Error esperado (cliente) → Mostrar mensaje
 * - 5xx: Error interno (servidor) → Mensaje genérico + logs completos
 */

function errorMiddleware(err, req, res, next) {
  // Obtener status code, por defecto 500
  const statusCode = err.statusCode || 500;
  
  // Determinar si es error interno (5xx)
  const isInternalError = statusCode >= 500;

  // REGISTRAR DETALLES SOLO PARA ERRORES INTERNOS (5xx)
  if (isInternalError) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR INTERNO DEL SERVIDOR (5xx)');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Método:', req.method);
    console.error('URL:', req.originalUrl);
    console.error('Status:', statusCode);
    console.error('Mensaje:', err.message);
    console.error('Stack:', err.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // Determinar mensaje de respuesta
  // 4xx: mensaje original (error esperado, información útil)
  // 5xx: mensaje genérico (no exponer detalles al cliente)
  const responseMessage = isInternalError
    ? 'Error interno del servidor. Por favor, intenta más tarde.'
    : (err.message || 'Ocurrió un error en la solicitud');

  // Responder al cliente con estructura estándar
  res.status(statusCode).json({
    message: responseMessage,
  });
}

module.exports = errorMiddleware;
