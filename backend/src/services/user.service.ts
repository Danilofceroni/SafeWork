import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

export async function findAll() {
  return prisma.user.findMany({
    include: { roles: { include: { role: { select: { codigo: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { roles: { include: { role: { select: { codigo: true } } } } },
  });
}

export async function create(data: {
  tenantId: string;
  rut: string;
  nombre: string;
  password: string;
  email?: string;
  roleCodigo: string;
}) {
  const existing = await prisma.user.findUnique({ where: { tenantId_rut: { tenantId: data.tenantId, rut: data.rut } } });
  if (existing) throw new Error("El RUT ya está registrado");

  const role = await prisma.role.findUnique({
    where: { tenantId_codigo: { tenantId: data.tenantId, codigo: data.roleCodigo } },
  });
  if (!role) throw new Error(`Rol ${data.roleCodigo} no encontrado`);

  const passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      tenantId: data.tenantId,
      rut: data.rut,
      nombre: data.nombre,
      email: data.email ?? null,
      passwordHash,
      roles: { create: { roleId: role.id } },
    },
    include: { roles: { include: { role: { select: { codigo: true } } } } },
  });
}

export async function update(id: string, data: Record<string, unknown>) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Usuario no encontrado");

  const updateData: Record<string, unknown> = { ...data };
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password as string, 10);
    delete updateData.password;
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    include: { roles: { include: { role: { select: { codigo: true } } } } },
  });
}

export async function remove(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Usuario no encontrado");

  await prisma.user.delete({ where: { id } });
}
