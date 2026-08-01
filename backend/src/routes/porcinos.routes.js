const express = require('express');
const porcinosController = require('../controllers/porcinos.controller');

const router = express.Router();

router.get('/', porcinosController.getPorcinos);
router.post('/', porcinosController.createPorcino);

module.exports = router;
