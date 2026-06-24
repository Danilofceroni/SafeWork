import 'dotenv/config';
import nodemailer from 'nodemailer';

async function main() {
  const user = process.env.GMAIL_USER ?? process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD ?? process.env.SMTP_PASS;
  const from = process.env.GMAIL_FROM ?? process.env.SMTP_FROM ?? user;
  const to = process.env.GMAIL_TO ?? process.env.SMTP_TO ?? user;

  if (!user || !pass) {
    throw new Error('Faltan credenciales. Define GMAIL_USER/GMAIL_APP_PASSWORD o SMTP_USER/SMTP_PASS en el archivo .env.');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user,
      pass,
    },
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Prueba SafeWork Gmail',
    text: 'Este es un correo de prueba usando Gmail SMTP.',
    html: '<p>Este es un correo de prueba usando Gmail SMTP.</p>',
  });

  console.log(`Correo enviado correctamente. Message ID: ${info.messageId}`);
}

main().catch((error: unknown) => {
  console.error('No se pudo enviar el correo con Gmail SMTP:', error);
  process.exit(1);
});
