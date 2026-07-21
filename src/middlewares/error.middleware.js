// Middlewares globales
function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error("========== INTERNAL ERROR ==========");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Stack:", error.stack);
    console.error("====================================");
  }

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : error.message,
  });
}

module.exports = {
  errorHandler,
};
