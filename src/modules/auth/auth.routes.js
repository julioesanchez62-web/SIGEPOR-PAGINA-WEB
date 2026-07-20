const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
  res.json({ message: "Ruta de login lista" });
});

module.exports = router;
