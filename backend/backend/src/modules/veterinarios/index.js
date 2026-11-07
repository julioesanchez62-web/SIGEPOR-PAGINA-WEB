const routes = require('./veterinarios.routes');
const controller = require('./veterinarios.controller');
const service = require('./veterinarios.service');
const repository = require('./veterinarios.repository');

module.exports = {
  routes,
  controller,
  service,
  repository
};
