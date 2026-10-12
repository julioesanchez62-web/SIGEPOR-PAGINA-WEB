const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authValidator = require('./auth.validator');

const passport = require('passport');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../middlewares/auth.middleware');

// POST /api/auth/login
router.post('/login', authValidator.validateLogin, authController.login);

/* ==========================================================================
   RUTAS DE AUTENTICACIÓN SOCIAL (Google & Facebook OAuth)
   ========================================================================== */

// 1. Google OAuth
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #fff; min-height: 100vh;">
        <h2 style="color: #f87171;">⚠️ Google OAuth aún no está configurado</h2>
        <p style="color: #94a3b8;">Debes configurar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en tu archivo backend/.env.</p>
        <a href="http://localhost:3001/registro_usuarios.html" style="color: #38bdf8; text-decoration: underline;">Volver al registro</a>
      </div>
    `);
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      console.error('[Google OAuth Error]:', err || info);
      return res.redirect('http://localhost:3001/registro_usuarios.html?error=oauth_failed');
    }

    // Generar token JWT para la sesión
    const token = jwt.sign(
      { id: user.id, idRol: user.idRol || 2, usuario: user.usuario, correo: user.correo || user.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Redirigir al panel o login enviando el token en query params para guardarlo en localStorage
    return res.redirect(`http://localhost:3001/indexpruebados.html?token=${token}&usuario=${encodeURIComponent(user.nombre || user.usuario)}`);
  })(req, res, next);
});

// 2. Facebook OAuth
router.get('/facebook', (req, res, next) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res.status(503).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #fff; min-height: 100vh;">
        <h2 style="color: #f87171;">⚠️ Facebook Login aún no está configurado</h2>
        <p style="color: #94a3b8;">Debes configurar FACEBOOK_APP_ID y FACEBOOK_APP_SECRET en tu archivo backend/.env.</p>
        <a href="http://localhost:3001/registro_usuarios.html" style="color: #38bdf8; text-decoration: underline;">Volver al registro</a>
      </div>
    `);
  }
  passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
});

router.get('/facebook/callback', (req, res, next) => {
  passport.authenticate('facebook', { session: false }, (err, user, info) => {
    if (err || !user) {
      console.error('[Facebook OAuth Error]:', err || info);
      return res.redirect('http://localhost:3001/registro_usuarios.html?error=oauth_failed');
    }

    const token = jwt.sign(
      { id: user.id, idRol: user.idRol || 2, usuario: user.usuario, correo: user.correo || user.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.redirect(`http://localhost:3001/indexpruebados.html?token=${token}&usuario=${encodeURIComponent(user.nombre || user.usuario)}`);
  })(req, res, next);
});

module.exports = router;