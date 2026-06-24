import test from 'node:test';
import assert from 'node:assert/strict';
import { processExpiringPermitNotifications } from './notifications.service.js';

test('envía correos solo para permisos activos próximos a vencer y evita duplicados', async () => {
  const sent: Array<{ to: string; subject: string }> = [];
  const prismaStub = {
    permit: {
      findMany: async () => [
        {
          id: 'permit-1',
          codigo: 'PTW-G-CS-2026-00001',
          fechaVencimiento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          estado: 'ACTIVO',
          solicitante: { nombre: 'Andres', email: 'andres.aguila1901@alumnos.ubiobio.cl' },
          permitType: { nombre: 'General' },
          plant: { nombre: 'Planta Central', sigla: 'CS' },
          location: { nombre: 'Zona Norte' },
          alertasEnviadas: [],
        },
        {
          id: 'permit-2',
          codigo: 'PTW-G-CS-2026-00002',
          fechaVencimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          estado: 'ACTIVO',
          solicitante: { nombre: 'Luis', email: 'luis@example.com' },
          permitType: { nombre: 'General' },
          plant: { nombre: 'Planta Central', sigla: 'CS' },
          location: { nombre: 'Zona Norte' },
          alertasEnviadas: [],
        },
        {
          id: 'permit-3',
          codigo: 'PTW-G-CS-2026-00003',
          fechaVencimiento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          estado: 'ACTIVO',
          solicitante: { nombre: 'Marta', email: 'marta@example.com' },
          permitType: { nombre: 'General' },
          plant: { nombre: 'Planta Central', sigla: 'CS' },
          location: { nombre: 'Zona Norte' },
          alertasEnviadas: ['expiring-3d'],
        },
      ],
      update: async (_args: unknown) => ({ ok: true }),
    },
  };

  const transportStub = {
    sendMail: async (mail: { to: string; subject: string }) => {
      sent.push({ to: mail.to, subject: mail.subject });
      return { messageId: '1' };
    },
  };

  const result = await processExpiringPermitNotifications({
    prismaClient: prismaStub as never,
    transporter: transportStub as never,
    now: new Date('2026-06-24T10:00:00.000Z'),
    daysBefore: 3,
  });

  assert.equal(result.sentCount, 1);
  assert.deepEqual(sent, [
    {
      to: 'andres.aguila1901@alumnos.ubiobio.cl',
      subject: 'Alerta de vencimiento de permiso de trabajo',
    },
  ]);
});
