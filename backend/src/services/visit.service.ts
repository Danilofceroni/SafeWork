import { prisma } from "../lib/prisma.js";
import { badRequest, forbidden, notFound } from "../lib/errors.js";
import type { Actor } from "./permit.service.js";
import type { Area } from "../../generated/prisma/client.js";

type VisitStatus = "PENDIENTE_PORTERIA" | "AUTORIZADA" | "EN_PLANTA" | "FINALIZADA" | "RECHAZADA";

export interface CrearVisitaInput {
  visitanteNombre: string;
  visitanteRut: string;
  visitanteEmpresa?: string | undefined;
  personaVisitada: string;
  motivo: string;
  area: Area;
  locationId: string;
  fechaVisita: string;
}

async function generarCodigo(tenantId: string): Promise<string> {
  const anio = new Date().getFullYear();
  const base = `VIS-${anio}-`;
  const ultimo = await prisma.visit.findFirst({
    where: { tenantId, codigo: { startsWith: base } },
    orderBy: { codigo: "desc" },
    select: { codigo: true },
  });
  let numero = 1;
  if (ultimo) {
    const partes = ultimo.codigo.split("-");
    const ultimoNum = parseInt(partes[partes.length - 1] ?? "0", 10);
    if (!Number.isNaN(ultimoNum)) numero = ultimoNum + 1;
  }
  return `${base}${String(numero).padStart(5, "0")}`;
}

export async function crearVisita(input: CrearVisitaInput, actor: Actor) {
  const location = await prisma.location.findFirst({
    where: { id: input.locationId, tenantId: actor.tenantId },
  });
  if (!location) throw notFound("Ubicación no encontrada");

  const fecha = new Date(input.fechaVisita);
  if (Number.isNaN(fecha.getTime())) throw badRequest("Fecha de visita inválida");

  const codigo = await generarCodigo(actor.tenantId);

  return prisma.visit.create({
    data: {
      tenantId: actor.tenantId,
      codigo,
      visitanteNombre: input.visitanteNombre,
      visitanteRut: input.visitanteRut,
      visitanteEmpresa: input.visitanteEmpresa ?? null,
      personaVisitada: input.personaVisitada,
      motivo: input.motivo,
      area: input.area,
      locationId: input.locationId,
      fechaVisita: fecha,
      solicitanteId: actor.userId,
    },
    include: { location: { select: { nombre: true, zone: { select: { nombre: true, plant: { select: { nombre: true, sigla: true } } } } } } },
  });
}

export async function listarVisitas(actor: Actor, filtros: { estado?: string }) {
  const where: Record<string, unknown> = { tenantId: actor.tenantId };
  if (filtros.estado && filtros.estado !== "todos") where.estado = filtros.estado;

  return prisma.visit.findMany({
    where,
    include: {
      location: { select: { nombre: true, zone: { select: { nombre: true, plant: { select: { nombre: true, sigla: true } } } } } },
      solicitante: { select: { nombre: true } },
      portero: { select: { nombre: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function obtenerVisita(id: string, actor: Actor) {
  const visita = await prisma.visit.findFirst({
    where: { id, tenantId: actor.tenantId },
    include: {
      location: { select: { nombre: true, zone: { select: { nombre: true, plant: { select: { nombre: true, sigla: true } } } } } },
      solicitante: { select: { nombre: true } },
      portero: { select: { nombre: true } },
    },
  });
  if (!visita) throw notFound("Visita no encontrada");
  return visita;
}

async function transicionar(id: string, actor: Actor, estadoDestino: VisitStatus, datos?: { porteroId?: string; fecha?: Date }) {
  const visita = await prisma.visit.findFirst({
    where: { id, tenantId: actor.tenantId },
  });
  if (!visita) throw notFound("Visita no encontrada");

  const transiciones: Record<string, VisitStatus[]> = {
    PENDIENTE_PORTERIA: ["AUTORIZADA", "RECHAZADA"],
    AUTORIZADA: ["EN_PLANTA"],
    EN_PLANTA: ["FINALIZADA"],
  };

  const permitidos = transiciones[visita.estado];
  if (!permitidos?.includes(estadoDestino)) {
    throw badRequest(`No se puede pasar de ${visita.estado} a ${estadoDestino}`);
  }

  const updateData: Record<string, unknown> = { estado: estadoDestino };
  if (datos?.porteroId) updateData.porteroId = datos.porteroId;
  if (datos?.fecha) {
    if (estadoDestino === "EN_PLANTA") updateData.fechaIngreso = datos.fecha;
    if (estadoDestino === "FINALIZADA") updateData.fechaSalida = datos.fecha;
  }

  return prisma.visit.update({
    where: { id },
    data: updateData,
    include: {
      location: { select: { nombre: true, zone: { select: { nombre: true, plant: { select: { nombre: true, sigla: true } } } } } },
      solicitante: { select: { nombre: true } },
      portero: { select: { nombre: true } },
    },
  });
}

export async function autorizarVisita(id: string, actor: Actor) {
  if (!actor.roles.includes("PORTERIA") && !actor.roles.includes("ADMIN")) {
    throw forbidden("Solo el rol PORTERIA puede autorizar visitas");
  }
  return transicionar(id, actor, "AUTORIZADA", { porteroId: actor.userId });
}

export async function rechazarVisita(id: string, actor: Actor) {
  if (!actor.roles.includes("PORTERIA") && !actor.roles.includes("ADMIN")) {
    throw forbidden("Solo el rol PORTERIA puede rechazar visitas");
  }
  return transicionar(id, actor, "RECHAZADA", { porteroId: actor.userId });
}

export async function registrarIngreso(id: string, actor: Actor) {
  if (!actor.roles.includes("PORTERIA") && !actor.roles.includes("ADMIN")) {
    throw forbidden("Solo el rol PORTERIA puede registrar ingreso");
  }
  return transicionar(id, actor, "EN_PLANTA", { fecha: new Date() });
}

export async function registrarSalida(id: string, actor: Actor) {
  return transicionar(id, actor, "FINALIZADA", { fecha: new Date() });
}
