/**
 app.js crea la aplicación;
configura middleware;
registra rutas;
exporta app.
 
*/

const express = require("express");
const usersRouter = require("./modules/users");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "SICE API is running",
  });
});

app.use("/api/users", usersRouter);

app.use(errorHandler);

module.exports = app;
