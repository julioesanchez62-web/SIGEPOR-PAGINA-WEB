const usersService = require("./users.service");

async function createUser(req, res, next) {
  console.log("3. Entró al controller");

  try {
    const result = await usersService.create(req.body);

    console.log("5. Controller recibió respuesta del service");

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
};
