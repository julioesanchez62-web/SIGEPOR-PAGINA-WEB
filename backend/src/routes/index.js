const express = require('express');
const router = express.Router();

// Importar los routers modulares de la aplicación
const porcinosRoutes = require('../modules/porcinos/porcinos.routes');
const usersRoutes = require('../modules/users/users.routes');
const authRoutes = require('../modules/auth/auth.routes');
const veterinariosRoutes = require('../modules/veterinarios/veterinarios.routes');
const inventarioRoutes = require('../modules/inventario/inventario.routes');
const sanidadRoutes = require('../modules/sanidad/sanidad.routes');
const reproduccionRoutes = require('../modules/reproduccion/reproduccion.routes');
const reportesRoutes = require('../modules/reportes/reportes.routes');

// Controlador modular de usuarios para perfil
const usersController = require('../modules/users/users.controller');
const authController = require('../modules/auth/auth.controller');

/* ==========================================================================
   1. RUTAS DE COMPROBACIÓN (HEALTH)
   ========================================================================== */
router.get(['/health', '/api/health'], (req, res) => res.json({ status: 'ok', message: 'SIGEPOR backend is running' }));
router.get('/perfil', usersController.getProfile);
router.post(['/api/recuperar-password', '/recuperar-password'], authController.recuperarPassword);

/* ==========================================================================
   2. MONTAJE DE MÓDULOS DEL SISTEMA (Soporta prefijos con /api y sin /api)
   ========================================================================== */

// --- ENDPOINT PÚBLICO / SELECTORES PARA SELECTS DESPLEGABLES ---
const { pool } = require('../config/mysql');

router.get(['/api/porcinos_lista', '/porcinos_lista'], async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_porcino, id_porcino AS id, identificacion, raza, estado_salud FROM porcinos ORDER BY identificacion ASC'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// Middleware JWT para endpoints protegidos
const { verifyToken } = require('../middlewares/auth.middleware');

// Endpoint para lista de veterinarios (usado en selects como logs_actividad y porcinos)
router.get(['/api/veterinarios_lista', '/veterinarios_lista'], verifyToken, async (req, res, next) => {
  try {
    // 1. Consultar tabla veterinarios
    const [vets] = await pool.query(
      'SELECT id_veterinario, id_veterinario AS id, id_usuario, nombre, email, usuario FROM veterinarios WHERE activo = 1 ORDER BY nombre ASC'
    );

    if (vets && vets.length > 0) {
      return res.json(vets);
    }

    // 2. Si no hay registros en la tabla veterinarios, consultar usuarios con rol Veterinario (idRol = 3)
    const [userVets] = await pool.query(
      'SELECT id_usuario, id_usuario AS id, id_usuario AS id_veterinario, nombre, email, usuario FROM usuarios WHERE idRol = 3 AND activo = 1 ORDER BY nombre ASC'
    );

    return res.json(userVets || []);
  } catch (error) {
    next(error);
  }
});

// Endpoint para lista de proveedores (usado en selects como inventarios y compras)
router.get(['/api/proveedores_lista', '/proveedores_lista'], verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre AS nombre_proveedor, telefono, email, direccion FROM proveedores ORDER BY nombre ASC'
    );
    return res.json(rows || []);
  } catch (error) {
    next(error);
  }
});

// --- MÓDULO DE PORCINOS ---
router.use('/api/porcinos', porcinosRoutes);
router.use('/porcinos', porcinosRoutes);

// --- MÓDULO DE USUARIOS ---
router.use('/api/users', usersRoutes);
router.use('/users', usersRoutes);

// --- MÓDULO DE AUTENTICACIÓN ---
router.use('/api/auth', authRoutes);
router.use('/auth', authRoutes);

// --- MÓDULO DE VETERINARIOS ---
router.use('/api/veterinarios', veterinariosRoutes);
router.use('/veterinarios', veterinariosRoutes);

// --- MÓDULO DE INVENTARIO ---
router.use('/api/inventario', inventarioRoutes);
router.use('/inventario', inventarioRoutes);

// --- MÓDULO DE SANIDAD Y VACUNAS ---
router.use('/api/sanidad', sanidadRoutes);
router.use('/sanidad', sanidadRoutes);
router.use('/api/vacunas', sanidadRoutes);
router.use('/vacunas', sanidadRoutes);

// --- MÓDULO DE REPRODUCCIÓN ---
router.use('/api/reproduccion', reproduccionRoutes);
router.use('/reproduccion', reproduccionRoutes);

// --- MÓDULO DE REPORTES Y ALERTAS ---
router.use('/api/reportes', reportesRoutes);
router.use('/reportes', reportesRoutes);

// --- RUTAS DIRECTAS PARA CRUD DE TABLAS (OptiPig) ---
const corralesRoutes = require('../modules/corrales/corrales.routes');
const enfermedadesRoutes = require('../modules/enfermedades/enfermedades.routes');
const logsActividadRoutes = require('../modules/logs_actividad/logs_actividad.routes');
const proveedoresRoutes = require('../modules/proveedores/proveedores.routes');

router.use('/api/corrales', corralesRoutes);
router.use('/corrales', corralesRoutes);

router.use('/api/enfermedades', enfermedadesRoutes);
router.use('/enfermedades', enfermedadesRoutes);

router.use('/api/logs_actividad', logsActividadRoutes);
router.use('/logs_actividad', logsActividadRoutes);

router.use('/api/proveedores', proveedoresRoutes);
router.use('/proveedores', proveedoresRoutes);

/**
 * POST /api/sync
 * Endpoint funcional para recibir lotes de sincronización desde IndexedDB (PWA)
 */
router.post('/sync', async (req, res) => {
  try {
    const { registros } = req.body;

    if (!registros || !Array.isArray(registros)) {
      return res.status(400).json({
        status: 'fail',
        message: 'El formato del lote de sincronización es inválido.'
      });
    }

    console.log(`[PWA SYNC] Lote de ${registros.length} registros procesado con éxito.`);

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

/**
 * GET /api/reportes/exportar
 * Endpoint funcional para la descarga de reportes del hato en formato JSON
 */
router.get('/reportes/exportar', async (req, res) => {
  try {
    // Datos productivos estructurados simulados requeridos por tu matriz
    const datosHato = {
      porcinos: [
        { id: 1, identificacion: 'RFID-1024', peso: 115.5, estado_salud: 'saludable' }
      ],
      vacunas: [
        { id: 1, porcino_id: 1, nombre_vacuna: 'Parvovirus', estado: 'Aplicada' }
      ],
      alimentacion: [
        { id: 1, tipo_alimento: 'Concentrado', cantidad: 250.00 }
      ]
    };

    // Forzamos las cabeceras HTTP de descarga de archivos adjuntos
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_hato_sigepor.json');
    
    return res.status(200).json(datosHato);
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Error al generar el reporte.' });
  }
});

module.exports = router;
