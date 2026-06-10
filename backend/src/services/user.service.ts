import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';
import type { Role } from '../../generated/prisma/index.js';

export async function findAll() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });
}

export async function create(data: { email: string; password: string; name: string; role: Role }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error('El email ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: { ...data, password: hashedPassword },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });
}

export async function update(id: string, data: Record<string, unknown>) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const updateData = { ...data };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password as string, 10);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });
}

export async function remove(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  await prisma.user.delete({ where: { id } });
}
