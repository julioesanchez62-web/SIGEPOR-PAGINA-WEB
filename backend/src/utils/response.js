function sendSuccess(res, statusCode, payload) {
  return res.status(statusCode).json(payload);
}

function sendError(res, statusCode, message, details = null) {
  const response = { success: false, message };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
}

module.exports = {
  sendSuccess,
  sendError
};
