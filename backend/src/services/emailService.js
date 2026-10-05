const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const EMAIL_TEST_TO = process.env.EMAIL_TEST_TO || null;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function sendEmail({ to, subject, html }) {
  if (!to) {
    throw new Error('Se requiere un destinatario para enviar el correo');
  }

  const originalRecipient = to;

  const finalRecipient =
    !IS_PRODUCTION && EMAIL_TEST_TO
      ? EMAIL_TEST_TO
      : originalRecipient;

  const developmentNotice =
    finalRecipient !== originalRecipient
      ? `
        <div
          style="
            margin-bottom: 20px;
            padding: 12px 16px;
            background: #fff2f7;
            border: 1px solid #edbdd2;
            border-radius: 10px;
            color: #482638;
            font-family: Arial, sans-serif;
          "
        >
          <strong>Modo de prueba</strong><br />
          Destinatario original: ${originalRecipient}
        </div>
      `
      : '';

  const { data, error } = await resend.emails.send({
    from: `Foto Minerva <${EMAIL_FROM}>`,
    to: [finalRecipient],
    subject,
    html: `
      ${developmentNotice}
      ${html}
    `,
  });

  if (error) {
    console.error('[Resend API Error]:', error);
    throw new Error(error.message || 'No se pudo enviar el correo');
  }

  return data;
}

async function sendTestEmail({ to }) {
  return sendEmail({
    to,
    subject: 'Prueba de correo - Foto Minerva',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #a23f6b;">Foto Minerva</h2>
        <p>El sistema de correo está funcionando correctamente.</p>
        <p>Este es un mensaje de prueba enviado desde el backend.</p>
      </div>
    `,
  });
}

async function sendWelcomeEmail({ to, name }) {
  return sendEmail({
    to,
    subject: 'Bienvenido a Foto Minerva',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #482638;">
        <h2 style="color: #a23f6b;">Foto Minerva</h2>

        <p>Hola ${name || 'usuario'},</p>

        <p>
          Tu cuenta fue creada correctamente.
          Ya puedes ingresar al sistema de Foto Minerva.
        </p>

        <p>
          Desde la plataforma podrás gestionar pedidos, clientes,
          sesiones, impresiones, productos y asistencia.
        </p>

        <p style="margin-top: 24px;">
          Gracias por usar Foto Minerva.
        </p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  return sendEmail({
    to,
    subject: 'Recuperar contraseña - Foto Minerva',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #482638;">
        <h2 style="color: #a23f6b;">Foto Minerva</h2>

        <p>Hola ${name || 'usuario'},</p>

        <p>
          Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        </p>

        <p>
          Haz clic en el siguiente enlace para crear una nueva contraseña:
        </p>

        <p style="margin: 24px 0;">
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #a23f6b;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Restablecer contraseña
          </a>
        </p>

        <p>
          Este enlace expirará pronto por seguridad.
        </p>

        <p>
          Si tú no solicitaste este cambio, puedes ignorar este mensaje.
        </p>
      </div>
    `,
  });
}

async function sendPasswordChangedEmail({ to, name }) {
  return sendEmail({
    to,
    subject: 'Contraseña actualizada - Foto Minerva',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #482638;">
        <h2 style="color: #a23f6b;">Foto Minerva</h2>

        <p>Hola ${name || 'usuario'},</p>

        <p>
          Te confirmamos que la contraseña de tu cuenta fue actualizada correctamente.
        </p>

        <p>
          Si tú realizaste este cambio, no necesitas hacer nada más.
        </p>

        <p>
          Si no reconoces este cambio, contacta al administrador del sistema.
        </p>

        <p style="margin-top: 24px;">
          Foto Minerva
        </p>
      </div>
    `,
  });
}

module.exports = {
  sendTestEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
};