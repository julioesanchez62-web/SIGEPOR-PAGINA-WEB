const authService = require('./auth.service');

async function login(req, res) {
  // 1. Extraemos las propiedades asegurando que coincidan con tu frontend (correo o email)
  const { correo, email, contraseña, registerPassword } = req.body;
  
  // Mapeo flexible por si el frontend envía 'correo' o 'email'
  const userEmail = email || correo;
  // Mapeo flexible por si el frontend envía 'contraseña' o 'registerPassword'
  const userPassword = contraseña || registerPassword;

  try {
    // VALIDACIÓN CRÍTICA: Se añade 'await' para detener el flujo si el servicio lanza el error 401
    const result = await authService.login(userEmail, userPassword);

    // Si el servicio no lanzó error, la autenticación es totalmente válida
    return res.status(200).json({
      status: 'success',
      mensaje: '¡Login exitoso!',
      message: '¡Login exitoso!',
      token: result.token,
      usuario: {
        id: result.user.id,
        nombre: result.user.nombre,
        email: result.user.email || result.user.correo,
        rol: result.user.idRol,
        idRol: result.user.idRol,
        rolNombre: result.rol || result.user.rolNombre
      },
      user: {
        ...result.user,
        token: result.token
      },
      data: {
        ...result.user,
        token: result.token
      }
    });

  } catch (error) {
    console.error('Error detectado en el login controlador:', error.message);
    
    // Si el error viene del servicio con un código de estado (como el 401)
    const statusCode = error.statusCode || 500;
    const mensaje = statusCode === 401 ? 'Correo o contraseña incorrectos' : 'Error interno del servidor';
    
    return res.status(statusCode).json({ mensaje });
  }
}

/**
 * Recuperación de contraseña por Correo Electrónico o WhatsApp
 * POST /api/recuperar-password & POST /api/auth/recuperar-password
 */
async function recuperarPassword(req, res) {
  try {
    const { metodo = 'email', email, correo, telefono, celular, identificador } = req.body;

    const metodoElegido = String(metodo).toLowerCase();
    const destinoEmail = email || correo || (metodoElegido === 'email' ? identificador : null);
    const destinoTelefono = telefono || celular || (metodoElegido === 'whatsapp' ? identificador : null);

    // Generar PIN numérico de 6 dígitos para la verificación
    const codigoPin = Math.floor(100000 + Math.random() * 900000).toString();

    if (metodoElegido === 'whatsapp') {
      if (!destinoTelefono || String(destinoTelefono).trim() === '') {
        return res.status(400).json({
          status: 'error',
          message: 'Debes proporcionar un número de teléfono o celular válido para recuperación vía WhatsApp.'
        });
      }

      const telefonoLimpio = String(destinoTelefono).replace(/[^0-9+]/g, '');

      /* ==========================================================================
       * STUB / INTEGRACIÓN CON WHATSAPP API (TWILIO O META WHATSAPP CLOUD API)
       * ==========================================================================
       * // Opción A: Twilio WhatsApp SDK
       * const twilio = require('twilio');
       * const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
       * await client.messages.create({
       *   from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER,
       *   to: 'whatsapp:' + telefonoLimpio,
       *   body: `🐖 *SIGEPOR 2026*\nTu código de recuperación es: *${codigoPin}*.\nUtiliza este código para restablecer tu contraseña. Válido por 15 minutos.`
       * });
       *
       * // Opción B: Meta Cloud API (WhatsApp Business Graph API)
       * const axios = require('axios');
       * await axios.post(`https://graph.facebook.com/v19.0/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
       *   messaging_product: 'whatsapp',
       *   to: telefonoLimpio,
       *   type: 'text',
       *   text: { body: `🐖 SIGEPOR 2026: Tu código de recuperación de contraseña es ${codigoPin}. Válido por 15 minutos.` }
       * }, {
       *   headers: { Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}` }
       * });
       * ========================================================================== */

      console.log(`[RECOVERY-WHATSAPP] Código de verificación ${codigoPin} generado para el número: ${telefonoLimpio}`);

      return res.status(200).json({
        status: 'success',
        metodo: 'whatsapp',
        destino: telefonoLimpio,
        message: `Se ha enviado el código de recuperación por WhatsApp al número ${telefonoLimpio}. (Código de prueba: ${codigoPin})`
      });

    } else {
      // Método por defecto: Correo Electrónico
      if (!destinoEmail || String(destinoEmail).trim() === '') {
        return res.status(400).json({
          status: 'error',
          message: 'Debes proporcionar una dirección de correo electrónico válida.'
        });
      }

      const correoLimpio = String(destinoEmail).trim().toLowerCase();

      /* ==========================================================================
       * STUB / INTEGRACIÓN CON NODEMAILER (ENVÍO DE CORREO POR SMTP)
       * ==========================================================================
       * const nodemailer = require('nodemailer');
       * const transporter = nodemailer.createTransport({
       *   service: 'gmail', // O host: process.env.SMTP_HOST, port: process.env.SMTP_PORT
       *   auth: {
       *     user: process.env.EMAIL_USER,
       *     pass: process.env.EMAIL_PASS
       *   }
       * });
       * await transporter.sendMail({
       *   from: '"Soporte SIGEPOR" <soporte@sigepor.com>',
       *   to: correoLimpio,
       *   subject: 'Recuperación de Contraseña - SIGEPOR 2026',
       *   html: `
       *     <div style="font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 25px; border-radius: 10px;">
       *       <h2 style="color: #10b981;">Restablecimiento de Contraseña SIGEPOR</h2>
       *       <p>Has solicitado restablecer tu contraseña en la plataforma.</p>
       *       <p>Tu código de verificación seguro es: <strong style="font-size: 1.4rem; color: #38bdf8;">${codigoPin}</strong></p>
       *       <p>Si no realizaste esta solicitud, puedes ignorar este mensaje de manera segura.</p>
       *     </div>
       *   `
       * });
       * ========================================================================== */

      console.log(`[RECOVERY-EMAIL] Token/PIN de recuperación ${codigoPin} generado para: ${correoLimpio}`);

      return res.status(200).json({
        status: 'success',
        metodo: 'email',
        destino: correoLimpio,
        message: `Se han enviado las instrucciones de recuperación al correo electrónico ${correoLimpio}. (Código de prueba: ${codigoPin})`
      });
    }
  } catch (error) {
    console.error('Error en recuperarPassword:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error interno al procesar la solicitud de recuperación.'
    });
  }
}

module.exports = {
  login,
  recuperarPassword
};
