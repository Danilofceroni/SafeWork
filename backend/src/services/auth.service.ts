import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../utils/prisma.js';
import type { Role } from '../../generated/prisma/index.js';

const sessionsDb = new Map<string, { userId: string; email: string; role: string }>();

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export async function register(email: string, password: string, name: string, role: Role) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('El email ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name, role },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });

  return user;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  if (!user.isActive) {
    throw new Error('Usuario desactivado');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('Credenciales inválidas');
  }

  const token = crypto.randomBytes(32).toString('hex');
  sessionsDb.set(token, { userId: user.id, email: user.email, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export function validateSession(token: string) {
  return sessionsDb.get(token);
}

export function revokeSession(token: string) {
  sessionsDb.delete(token);
}
