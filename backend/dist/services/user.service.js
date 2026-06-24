import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
export async function findAll() {
    return prisma.user.findMany({
        select: { id: true, email: true, nombre: true, rut: true, activo: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
    });
}
export async function findById(id) {
    return prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, nombre: true, rut: true, activo: true, createdAt: true, updatedAt: true },
    });
}
export async function create(data) {
    const tenantId = data.tenantId ?? 'tenant-demo';
    const rut = data.rut ?? `user-${Date.now()}`;
    const nombre = data.nombre ?? data.name ?? 'Usuario';
    const existing = await prisma.user.findFirst({ where: { tenantId, rut } });
    if (existing) {
        throw new Error('El usuario ya está registrado');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
        data: {
            tenantId,
            rut,
            nombre,
            email: data.email ?? null,
            passwordHash: hashedPassword,
            zonasAsignadas: [],
            activo: true,
        },
        select: { id: true, email: true, nombre: true, rut: true, activo: true, createdAt: true },
    });
}
export async function update(id, data) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    const updateData = { ...data };
    if (data.password) {
        updateData.passwordHash = await bcrypt.hash(data.password, 10);
        delete updateData.password;
    }
    return prisma.user.update({
        where: { id },
        data: updateData,
        select: { id: true, email: true, nombre: true, rut: true, activo: true, createdAt: true, updatedAt: true },
    });
}
export async function remove(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    await prisma.user.delete({ where: { id } });
}
//# sourceMappingURL=user.service.js.map