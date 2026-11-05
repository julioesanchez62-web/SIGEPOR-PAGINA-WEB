const cors = require('cors');
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const indexRoutes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const { sessionSecret, corsOrigin } = require('./config/env');

const app = express();

/**
 * ORDEN CORRECTO DE MIDDLEWARES EN EXPRESS
 * 
 * 1️⃣ Middlewares globales (CORS, body parser, session, etc.)
 * 2️⃣ Rutas
 * 3️⃣ Capturador de 404 (rutas no encontradas)
 * 4️⃣ Middleware de errores (SIEMPRE al final)
 */

// 1. Configuración de CORS permitiendo orígenes de Vercel y localhost
const allowedOrigins = corsOrigin === '*'
  ? '*'
  : corsOrigin.split(',').map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como herramientas de prueba o apps móviles)
    if (!origin || allowedOrigins === '*') return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback permisivo para producción
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión requerida para Passport OAuth flow
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 2. Rutas principales
app.use('/', indexRoutes);

// 3. Capturador de 404
app.use((req, res, next) => {
  const error = new Error('Ruta no encontrada');
  error.statusCode = 404;
  next(error);
});

// 4. Middleware de errores (SIEMPRE ÚLTIMO)
app.use(errorMiddleware);

module.exports = app;
