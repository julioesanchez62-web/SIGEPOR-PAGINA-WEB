const express = require('express');
const usersRoutes = require('./modules/users');

const app = express();

app.use(express.json());

// Montar el módulo de usuarios
app.use('/api/v1/users', usersRoutes);

module.exports = app;