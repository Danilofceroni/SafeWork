/**
 * Autenticación multi-tenant. El login resuelve el tenant por `slug`, valida
 * credenciales (bcrypt) y emite access + refresh con el `tenantId` en el claim.
 */
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { unauthorized } from "../lib/errors.js";
import {
  firmarAccessToken,
  firmarRefreshToken,
  verificarRefreshToken,
  type TokenPayload,
} from "../lib/jwt.js";

export interface LoginInput {
  tenantSlug: string;
  rut: string;
  password: string;
}

interface PerfilUsuario {
  id: string;
  rut: string;
  nombre: string;
  roles: string[];
  tenantId: string;
  companyId: string | null;
}

async function cargarUsuarioConRoles(tenantId: string, rut: string) {
  return prisma.user.findFirst({
    where: { tenantId, rut, activo: true },
    include: { roles: { include: { role: { select: { codigo: true } } } } },
  });
}

export async function login(input: LoginInput) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: input.tenantSlug }, select: { id: true, activo: true } });
  if (!tenant || !tenant.activo) throw unauthorized("Credenciales inválidas");

  const user = await cargarUsuarioConRoles(tenant.id, input.rut);
  if (!user || !bcrypt.compareSync(input.password, user.passwordHash)) {
    throw unauthorized("Credenciales inválidas");
  }

  const roles = user.roles.map((r: { role: { codigo: string } }) => r.role.codigo)
  const payload: TokenPayload = { sub: user.id, tenantId: tenant.id, roles, companyId: user.companyId };

  const perfil: PerfilUsuario = {
    id: user.id,
    rut: user.rut,
    nombre: user.nombre,
    roles,
    tenantId: tenant.id,
    companyId: user.companyId,
  };

  return {
    accessToken: firmarAccessToken(payload),
    refreshToken: firmarRefreshToken(payload),
    user: perfil,
  };
}

export async function refrescarSesion(refreshToken: string) {
  let datos: TokenPayload;
  try {
    datos = verificarRefreshToken(refreshToken);
  } catch {
    throw unauthorized("Refresh token inválido o expirado");
  }

  // Recargar roles desde la BD (pueden haber cambiado desde la emisión)
  const user = await prisma.user.findFirst({
    where: { id: datos.sub, tenantId: datos.tenantId, activo: true },
    include: { roles: { include: { role: { select: { codigo: true } } } } },
  });
  if (!user) throw unauthorized("Usuario no encontrado o inactivo");

  const roles = user.roles.map((r: { role: { codigo: string } }) => r.role.codigo)
  const payload: TokenPayload = { sub: user.id, tenantId: datos.tenantId, roles, companyId: user.companyId };
  return { accessToken: firmarAccessToken(payload) };
}

export async function obtenerPerfil(userId: string, tenantId: string): Promise<PerfilUsuario> {
  const user = await prisma.user.findFirstOrThrow({
    where: { id: userId, tenantId },
    include: { roles: { include: { role: { select: { codigo: true } } } } },
  });
  return {
    id: user.id,
    rut: user.rut,
    nombre: user.nombre,
    roles: user.roles.map((r: { role: { codigo: string } }) => r.role.codigo),
    tenantId,
    companyId: user.companyId,
  };
}