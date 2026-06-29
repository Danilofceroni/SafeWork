import 'dotenv/config';
import nodemailer from 'nodemailer';

async function main() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? 'SafeWork <noreply@safework.local>';
  const to = process.env.SMTP_TO ?? process.env.SMTP_USER ?? 'test@example.com';

  if (!host || !user || !pass) {
    console.error('SMTP no configurado. Define SMTP_HOST, SMTP_USER y SMTP_PASS en el archivo .env.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Prueba de correo SafeWork',
    text: 'Este es un correo de prueba del sistema de notificaciones de SafeWork.',
    html: '<p>Este es un correo de prueba del sistema de notificaciones de SafeWork.</p>',
  });

  console.log(`Correo enviado correctamente. Message ID: ${info.messageId}`);
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error('No se pudo enviar el correo de prueba.');
    console.error('Detalle:', error.message);
    console.error('Sugerencia: verifica SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y que el proveedor acepte SMTP desde esta cuenta.');
  } else {
    console.error('No se pudo enviar el correo de prueba:', error);
  }
  process.exit(1);
});
