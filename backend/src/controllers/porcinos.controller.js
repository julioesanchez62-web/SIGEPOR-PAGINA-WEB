const porcinosService = require('../services/porcinos.service');
const { sendSuccess } = require('../utils/response');

async function getPorcinos(req, res, next) {
  try {
    const result = await porcinosService.getPorcinos();
    return sendSuccess(res, 200, result);
  } catch (error) {
    next(error);
  }
}

async function createPorcino(req, res, next) {
  try {
    const result = await porcinosService.createPorcino(req.body);
    return sendSuccess(res, 201, result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPorcinos,
  createPorcino
};
