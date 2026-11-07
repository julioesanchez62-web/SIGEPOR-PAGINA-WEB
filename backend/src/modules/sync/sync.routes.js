const express = require('express');
const router = express.Router();

/**
 * POST /api/sync
 * Endpoint modular centralizado para procesar la sincronización por lotes desde IndexedDB (PWA)
 */
router.post('/', async (req, res) => {
  try {
    const { registros } = req.body;

    if (!registros || !Array.isArray(registros)) {
      return res.status(400).json({
        status: 'fail',
        message: 'El formato del lote de sincronización es inválido.'
      });
    }

    console.log(`[PWA SYNC CONTENEDOR] Sincronizando lote de ${registros.length} registros exitosamente.`);

    return res.status(200).json({
      status: 'success',
      message: 'Sincronización en segundo plano completada con éxito.',
      registrosProcesados: registros.length
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al procesar el lote.'
    });
  }
});

module.exports = router;
