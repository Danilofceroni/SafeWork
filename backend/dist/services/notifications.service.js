import nodemailer from 'nodemailer';
function getNotificationTag(daysBefore) {
    return `expiring-${daysBefore}d`;
}
async function getPrismaClient() {
    const { prisma } = await import('../lib/prisma.js');
    return prisma;
}
function buildTransporter() {
    const host = process.env.SMTP_HOST;
    if (!host) {
        return null;
    }
    return nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER && process.env.SMTP_PASS
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
            : undefined,
    });
}
export async function processExpiringPermitNotifications(options = {}) {
    const prismaClient = options.prismaClient ?? (await getPrismaClient());
    const transporter = options.transporter ?? buildTransporter();
    const now = options.now ?? new Date();
    const daysBefore = options.daysBefore ?? Number(process.env.NOTIFICATION_DAYS_BEFORE ?? 3);
    const tag = getNotificationTag(daysBefore);
    if (!transporter) {
        return {
            sentCount: 0,
            checkedCount: 0,
            skippedCount: 0,
            reason: 'SMTP_NOT_CONFIGURED',
        };
    }
    const cutoff = new Date(now.getTime() + daysBefore * 24 * 60 * 60 * 1000);
    const permits = await prismaClient.permit.findMany({
        where: {
            estado: 'ACTIVO',
            fechaVencimiento: {
                gte: now,
                lte: cutoff,
            },
        },
        select: {
            id: true,
            codigo: true,
            fechaVencimiento: true,
            alertasEnviadas: true,
            solicitante: {
                select: {
                    nombre: true,
                    email: true,
                },
            },
            permitType: {
                select: {
                    nombre: true,
                },
            },
            plant: {
                select: {
                    nombre: true,
                    sigla: true,
                },
            },
            location: {
                select: {
                    nombre: true,
                },
            },
        },
    });
    let sentCount = 0;
    let skippedCount = 0;
    const eligiblePermits = permits.filter((permit) => {
        const expiresAt = permit.fechaVencimiento;
        if (!expiresAt)
            return false;
        return expiresAt >= now && expiresAt <= cutoff;
    });
    for (const permit of eligiblePermits) {
        if ((permit.alertasEnviadas ?? []).includes(tag)) {
            skippedCount += 1;
            continue;
        }
        const recipient = permit.solicitante?.email;
        if (!recipient) {
            skippedCount += 1;
            continue;
        }
        const expiresAt = permit.fechaVencimiento.toLocaleString('es-CL', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
        await transporter.sendMail({
            from: process.env.SMTP_FROM ?? 'SafeWork <noreply@safework.local>',
            to: recipient,
            subject: 'Alerta de vencimiento de permiso de trabajo',
            text: `Hola ${permit.solicitante?.nombre ?? 'usuario'},\n\nEl permiso ${permit.codigo} (${permit.permitType?.nombre ?? 'sin tipo'}) está próximo a vencer.\nPlanta: ${permit.plant?.nombre ?? '-'} (${permit.plant?.sigla ?? '-'})\nUbicación: ${permit.location?.nombre ?? '-'}\nVence: ${expiresAt}\n\nPor favor, revisa y renueva o cierra el permiso antes de esa fecha.`,
            html: `<p>Hola ${permit.solicitante?.nombre ?? 'usuario'},</p><p>El permiso <strong>${permit.codigo}</strong> (${permit.permitType?.nombre ?? 'sin tipo'}) está próximo a vencer.</p><ul><li>Planta: ${permit.plant?.nombre ?? '-'} (${permit.plant?.sigla ?? '-'})</li><li>Ubicación: ${permit.location?.nombre ?? '-'}</li><li>Vence: ${expiresAt}</li></ul><p>Por favor, revisa y renueva o cierra el permiso antes de esa fecha.</p>`,
        });
        await prismaClient.permit.update({
            where: { id: permit.id },
            data: {
                alertasEnviadas: {
                    set: [...(permit.alertasEnviadas ?? []), tag],
                },
            },
        });
        sentCount += 1;
    }
    return {
        sentCount,
        checkedCount: permits.length,
        skippedCount,
    };
}
export function startPermitExpirationNotifications() {
    const transporter = buildTransporter();
    if (!transporter) {
        console.info('Notificaciones por correo deshabilitadas: falta configuración SMTP.');
        return null;
    }
    const intervalMs = Number(process.env.NOTIFICATION_INTERVAL_MS ?? 6 * 60 * 60 * 1000);
    void processExpiringPermitNotifications({ transporter }).then((result) => {
        if (result.sentCount > 0 || result.checkedCount > 0) {
            console.info(`[notifications] permisos revisados: ${result.checkedCount}, enviados: ${result.sentCount}, omitidos: ${result.skippedCount}`);
        }
    });
    const intervalId = setInterval(() => {
        void processExpiringPermitNotifications({ transporter }).catch((error) => {
            console.error('[notifications] error al revisar permisos por vencer', error);
        });
    }, intervalMs);
    return () => clearInterval(intervalId);
}
//# sourceMappingURL=notifications.service.js.map