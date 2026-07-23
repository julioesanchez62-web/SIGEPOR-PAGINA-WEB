// Importa Express para crear el router del módulo de autenticación.
const express = require("express");
// Crea un router específico para las rutas de autenticación.
const router = express.Router();

// Define la ruta de login para verificar que el módulo está registrado correctamente.
router.get("/login", (req, res) => {
  // Responde con un JSON simple indicando que la ruta está lista.
  res.json({ message: "Ruta de login lista" });
});

// Exporta el router para que pueda ser montado desde la aplicación principal.
module.exports = router;
