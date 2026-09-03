const usersService = require('../services/users.service');
const { sendSuccess, sendError } = require('../utils/response');

async function createUser(req, res, next) {
  try {
    const result = await usersService.createUser(req.body);
    return sendSuccess(res, 201, result);
  } catch (error) {
    next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const result = await usersService.getUsers();
    return sendSuccess(res, 200, result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  getUsers
};
