import test from 'node:test';
import assert from 'node:assert/strict';
import { processExpiringPermitNotifications } from './notifications.service.js';
test('envía correos solo para permisos activos próximos a vencer y evita duplicados', async () => {
    const sent = [];
    const prismaStub = {
        permit: {
            findMany: async () => [
                {
                    id: 'permit-1',
                    codigo: 'PTW-G-CS-2026-00001',
                    fechaVencimiento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                    estado: 'ACTIVO',
                    solicitante: { nombre: 'Ana', email: 'ana@example.com' },
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
            update: async (_args) => ({ ok: true }),
        },
    };
    const transportStub = {
        sendMail: async (mail) => {
            sent.push({ to: mail.to, subject: mail.subject });
            return { messageId: '1' };
        },
    };
    const result = await processExpiringPermitNotifications({
        prismaClient: prismaStub,
        transporter: transportStub,
        now: new Date('2026-06-24T10:00:00.000Z'),
        daysBefore: 3,
    });
    assert.equal(result.sentCount, 1);
    assert.deepEqual(sent, [
        {
            to: 'ana@example.com',
            subject: 'Alerta de vencimiento de permiso de trabajo',
        },
    ]);
});
//# sourceMappingURL=notifications.service.test.js.map