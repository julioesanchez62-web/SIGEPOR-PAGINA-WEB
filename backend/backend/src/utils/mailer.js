/**
 * Servicio centralizado para envío de correos electrónicos
 * SIGEPOR 2026 - Módulo de Notificaciones
 */

const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Obtener o inicializar el transporte SMTP de Nodemailer
 */
function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true para 465, false para 587 con TLS
    auth: {
      user,
      pass
    }
  });

  return transporter;
}

/**
 * Enviar correo de bienvenida al registrarse en SIGEPOR
 * @param {Object} params
 * @param {string} params.email - Destinatario
 * @param {string} params.nombre - Nombre del usuario
 * @param {string} params.origen - Origen del registro ('formulario', 'Google', 'Facebook')
 */
async function sendWelcomeEmail({ email, nombre, origen = 'formulario' }) {
  try {
    if (!email) return false;

    const mailClient = getTransporter();

    // Plantilla HTML elegante acorde al dark theme de SIGEPOR 2026
    const htmlContent = `
      <div style="background-color: #0b0f19; color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; padding: 35px 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <div style="display: inline-block; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 50px; padding: 6px 18px; margin-bottom: 20px;">
            <span style="color: #10b981; font-weight: 700; font-size: 13px; letter-spacing: 1px;">SIGEPOR 2026 • REGISTRO EXITOSO</span>
          </div>

          <h1 style="color: #ffffff; font-size: 26px; margin: 0 0 15px 0; font-weight: 700;">
            ¡Bienvenido a SIGEPOR 2026!
          </h1>

          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Hola <strong style="color: #38bdf8;">${nombre || 'Usuario'}</strong>, tu cuenta ha sido creada exitosamente mediante <strong style="color: #10b981;">${origen}</strong>.
          </p>

          <div style="background: rgba(255, 255, 255, 0.04); border-left: 4px solid #10b981; border-radius: 8px; padding: 15px; margin: 25px 0; text-align: left;">
            <p style="margin: 0; color: #cbd5e1; font-size: 14px;">
              🛡️ Tu cuenta está activa y lista para gestionar corrales, inventarios, trazabilidad porcina y sanidad clínica en la plataforma.
            </p>
          </div>

          <a href="http://localhost:3001/indexpruebados.html" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #000000; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); margin-top: 10px;">
            Ingresar al Panel de Gestión
          </a>

          <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 35px 0 20px 0;">

          <p style="color: #64748b; font-size: 12px; margin: 0;">
            © 2026 OptiPig / SIGEPOR - Sistema Integral de Gestión Porcina. Si no solicitaste esta cuenta, por favor contáctanos de inmediato.
          </p>
        </div>
      </div>
    `;

    if (!mailClient) {
      console.warn(`[Nodemailer] ⚠️ Variables SMTP no configuradas en .env. Simulación de bienvenida enviada a ${email} (${nombre}).`);
      return { simulated: true, email };
    }

    const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@sigepor.com';

    const info = await mailClient.sendMail({
      from: `"OptiPig SIGEPOR 2026" <${senderEmail}>`,
      to: email,
      subject: '¡Bienvenido a SIGEPOR 2026! Tu registro ha sido exitoso 🎉',
      html: htmlContent
    });

    console.log(`[Nodemailer] ✓ Correo de bienvenida enviado a ${email}. ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Nodemailer Error] No se pudo enviar el correo a ${email}:`, error.message);
    return false;
  }
}

module.exports = {
  sendWelcomeEmail,
  getTransporter
};
