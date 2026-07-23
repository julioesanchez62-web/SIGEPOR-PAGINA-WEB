// Middleware global encargado de centralizar el manejo de errores de la API.
function errorHandler(error, req, res, next) {
  // Obtiene el código HTTP del error si fue definido, o usa 500 como valor por defecto.
  const statusCode = error.statusCode || 500;

  // Si el error es interno, registra información detallada en la consola.
  if (statusCode >= 500) {
    console.error("========== INTERNAL ERROR ==========");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Stack:", error.stack);
    console.error("====================================");
  }

  // Envía la respuesta final al cliente con el mensaje correspondiente.
  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : error.message,
  });
}

// Exporta el middleware para que Express lo pueda registrar en la aplicación.
module.exports = {
  errorHandler,
};
