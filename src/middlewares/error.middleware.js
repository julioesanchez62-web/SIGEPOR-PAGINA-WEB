// Middleware global encargado de centralizar el manejo de errores de la API.
function errorHandler(error, req, res, next) {
  // Obtiene el código HTTP definido o usa 500 por defecto.
  const statusCode = error.statusCode || 500;

  // Registra información técnica únicamente para errores internos.
  if (statusCode >= 500) {
    console.error("========== INTERNAL ERROR ==========");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Stack:", error.stack);
    console.error("====================================");
  }

  // Envía una respuesta controlada al cliente.
  return res.status(statusCode).json({
    message: statusCode >= 500 ? "Internal server error" : error.message,
  });
}

module.exports = {
  errorHandler,
};
