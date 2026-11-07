const cors = require('cors');
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const indexRoutes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const { sessionSecret, corsOrigin } = require('./config/env');

const app = express();

/**
 * 1. REVERSE PROXY CONFIGURATION
 * Requerido en Railway, Heroku, Render o Docker para detectar HTTPS
 * y permitir que las cookies 'Secure' y 'SameSite=None' no sean bloqueadas por el navegador.
 */
app.set('trust proxy', 1);

/**
 * 2. CONFIGURACIÓN ROBUSTA DE CORS (Cross-Origin Resource Sharing)
 * Permite que el frontend en Vercel (y localmente) consuma la API sin bloqueos de navegador.
 */
const allowedExplicit = corsOrigin === '*'
  ? []
  : corsOrigin.split(',').map((o) => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir llamadas sin origen (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Permitir Vercel (*.vercel.app), Railway (*.railway.app), localhost y orígenes explícitos
    const isVercel = /\.vercel\.app$/.test(origin);
    const isRailway = /\.railway\.app$/.test(origin);
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isExplicit = allowedExplicit.indexOf(origin) !== -1 || corsOrigin === '*';

    if (isVercel || isRailway || isLocalhost || isExplicit) {
      return callback(null, true);
    }

    // Fallback permisivo para producción
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Accept', 'X-Requested-With'],
  optionsSuccessStatus: 204
};

// Aplicar CORS globalmente y responder a todos los preflight OPTIONS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 3. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Configuración de Sesión (express-session para Passport OAuth flow)
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

// 5. Rutas principales de la aplicación
app.use('/api', indexRoutes);

// 6. Capturador de 404 (Rutas no encontradas)
app.use((req, res, next) => {
  const error = new Error('Ruta no encontrada');
  error.statusCode = 404;
  next(error);
});

// 7. Middleware de errores centralizado (SIEMPRE AL FINAL)
app.use(errorMiddleware);



module.exports = app;
