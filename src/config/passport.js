/**
 * Configuración de Passport.js para Autenticación Social (Google y Facebook)
 * SIGEPOR 2026
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const crypto = require('crypto');
const usersRepository = require('../modules/users/users.repository');
const { sendWelcomeEmail } = require('../utils/mailer');

/**
 * Serialización y deserialización para manejo de sesiones
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersRepository.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

/**
 * Función auxiliar para buscar usuario existente o registrar uno nuevo si no existe
 */
async function processSocialUser({ provider, profileId, email, displayName }) {
  const finalEmail = email || `${provider.toLowerCase()}_${profileId}@social.sigepor.local`;
  const cleanDisplayName = displayName || `${provider} User`;

  // 1. Buscar si ya existe por email o por nombre de usuario
  let user = await usersRepository.findByEmailOrUsername(finalEmail);

  if (!user) {
    // Si no existe, registrar automáticamente en la tabla usuarios de MySQL
    const uniqueSuffix = crypto.randomBytes(3).toString('hex');
    const baseUsername = cleanDisplayName.toLowerCase().replace(/[^a-z0-9]/g, '') || provider.toLowerCase();
    const generatedUsername = `${baseUsername}_${uniqueSuffix}`.substring(0, 45);
    const randomPassword = crypto.randomBytes(16).toString('hex');

    console.log(`[OAuth] Registrando nuevo usuario en MySQL desde ${provider}: ${finalEmail}`);

    const createdUser = await usersRepository.createUser({
      nombre: cleanDisplayName,
      correo: finalEmail,
      usuario: generatedUsername,
      contraseña: randomPassword,
      idRol: 2, // Rol Empleado / Operador por defecto
      telefono: null
    });

    user = {
      id: createdUser.id,
      nombre: cleanDisplayName,
      correo: finalEmail,
      usuario: generatedUsername,
      idRol: 2
    };

    // Enviar correo de bienvenida asíncrono
    sendWelcomeEmail({
      email: finalEmail,
      nombre: cleanDisplayName,
      origen: provider
    }).catch(err => console.error('[OAuth Mail Error]:', err.message));
  } else {
    console.log(`[OAuth] Usuario existente autenticado vía ${provider}: ${user.correo || user.email}`);
  }

  return user;
}

/**
 * 1. Configuración de Google Strategy
 */
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallback = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback';

if (googleClientId && googleClientSecret) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallback
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const displayName = profile.displayName || (profile.name ? `${profile.name.givenName} ${profile.name.familyName}` : 'Usuario Google');
      
      const user = await processSocialUser({
        provider: 'Google',
        profileId: profile.id,
        email,
        displayName
      });

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
} else {
  console.log('[Passport] ⚠️ GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no configurados en .env (Modo Standby)');
}

/**
 * 2. Configuración de Facebook Strategy
 */
const facebookAppId = process.env.FACEBOOK_APP_ID;
const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
const facebookCallback = process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3001/auth/facebook/callback';

if (facebookAppId && facebookAppSecret) {
  passport.use(new FacebookStrategy({
    clientID: facebookAppId,
    clientSecret: facebookAppSecret,
    callbackURL: facebookCallback,
    profileFields: ['id', 'displayName', 'emails', 'name']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const displayName = profile.displayName || 'Usuario Facebook';

      const user = await processSocialUser({
        provider: 'Facebook',
        profileId: profile.id,
        email,
        displayName
      });

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
} else {
  console.log('[Passport] ⚠️ FACEBOOK_APP_ID o FACEBOOK_APP_SECRET no configurados en .env (Modo Standby)');
}

module.exports = passport;
