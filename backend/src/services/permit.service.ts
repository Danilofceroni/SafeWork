/**
 * Servicio de permisos — núcleo de negocio (Fase 2).
 *
 * Orquesta la creación y las transiciones de estado usando el motor declarativo
 * (`workflow.engine`). Toda operación:
 *   - está acotada al tenant del actor (multi-tenancy explícito),
 *   - registra un `AuditLog` (trazabilidad append-only),
 *   - deriva el flujo de las filas de `WorkflowStep`, no de `if/else`.
 */
import { prisma } from "../lib/prisma.js";
import type { PermitStatus } from "../../generated/prisma/index.js";
import { badRequest, forbidden, notFound } from "../lib/errors.js";
import { anioActual, calcularVencimiento, parseFechaInicio } from "../lib/datetime.js";
import {
  construirContexto,
  esEstadoTerminal,
  puedeTransicionar,
  resolverTransicion,
} from "./workflow.engine.js";
import type { CrearPermisoInput, TransicionInput } from "./permit.schemas.js";

/** Identidad del usuario que ejecuta la acción (vendrá del JWT en Fase 2b). */
export interface Actor {
  tenantId: string;
  userId: string;
  roles: string[];
  companyId?: string | null;
}

const ESTADOS_CONTRATISTA = ["PENDIENTE_CONTRATISTA", "OBSERVADO"];

// ----------------------------------------------------------------
// Generación de código: PTW-{prefijo}-{sigla}-{año}-{correlativo}
// ----------------------------------------------------------------
async function generarCodigo(tenantId: string, prefijoTipo: string, sigla: string, anio: number): Promise<string> {
  const base = `PTW-${prefijoTipo}-${sigla}-${anio}-`;
  const ultimo = await prisma.permit.findFirst({
    where: { tenantId, codigo: { startsWith: base } },
    orderBy: { codigo: "desc" }, // el correlativo va con padding de 5 → orden lexical = numérico
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

// ----------------------------------------------------------------
// Crear permiso
// ----------------------------------------------------------------
export async function crearPermiso(input: CrearPermisoInput, actor: Actor) {
  const tenant = await prisma.tenant.findUnique({ where: { id: actor.tenantId }, select: { timezone: true } });
  if (!tenant) throw notFound("Tenant no encontrado");

  const permitType = await prisma.permitType.findFirst({
    where: { id: input.permitTypeId, tenantId: actor.tenantId },
    select: {
      prefijo: true,
      vigenciaDias: true,
      vigenciaHastaFinDeMes: true,
      requierePermisoPadre: true,
      workflowId: true,
    },
  });
  if (!permitType) throw notFound("Tipo de permiso no encontrado");

  // Validar planta y ubicación dentro del tenant
  const plant = await prisma.plant.findFirst({
    where: { id: input.plantId, tenantId: actor.tenantId },
    select: { sigla: true },
  });
  if (!plant) throw notFound("Planta no encontrada");

  const location = await prisma.location.findFirst({
    where: { id: input.locationId, tenantId: actor.tenantId },
    select: { id: true },
  });
  if (!location) throw notFound("Ubicación no encontrada");

  // Vinculación padre-hijo (RN-02)
  let permisoPadreId: string | undefined;
  if (permitType.requierePermisoPadre) {
    if (!input.permisoPadreId) throw badRequest("Este tipo de permiso debe vincularse a un permiso padre");
    const padre = await prisma.permit.findFirst({
      where: { id: input.permisoPadreId, tenantId: actor.tenantId },
      select: { id: true, estado: true },
    });
    if (!padre) throw notFound("Permiso padre no encontrado");
    if (esEstadoTerminal(padre.estado)) {
      throw badRequest(`No se puede vincular: el permiso padre está ${padre.estado}`);
    }
    permisoPadreId = padre.id;
  }

  // Fechas (con timezone del tenant)
  const fechaInicio = parseFechaInicio(input.fechaInicio, tenant.timezone);
  if (!fechaInicio) throw badRequest("Fecha de inicio inválida. Use YYYY-MM-DD o DD/MM/YYYY");
  const fechaVencimiento = calcularVencimiento(
    fechaInicio,
    { vigenciaDias: permitType.vigenciaDias, vigenciaHastaFinDeMes: permitType.vigenciaHastaFinDeMes },
    tenant.timezone,
  );

  const codigo = await generarCodigo(actor.tenantId, permitType.prefijo, plant.sigla, anioActual(tenant.timezone));

  // Empresa para la cuadrilla (si hay trabajadores)
  const companyIdCuadrilla = input.companyId ?? actor.companyId ?? null;

  return prisma.$transaction(async (tx) => {
    const permit = await tx.permit.create({
      data: {
        tenantId: actor.tenantId,
        codigo,
        permitTypeId: input.permitTypeId,
        workflowId: permitType.workflowId, // snapshot del workflow
        solicitanteId: actor.userId,
        plantId: input.plantId,
        locationId: input.locationId,
        area: input.area,
        descripcion: input.descripcion,
        estado: "BORRADOR",
        fechaInicio,
        fechaVencimiento,
        ...(permisoPadreId ? { permisoPadreId } : {}),
        ...(input.companyId ? { companyId: input.companyId } : {}),
        ...(input.codigoCartaFuego ? { codigoCartaFuego: input.codigoCartaFuego } : {}),
        ...(input.riesgos ? { riesgos: input.riesgos } : {}),
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId: actor.tenantId,
        permitId: permit.id,
        userId: actor.userId,
        accion: "CREACION",
        estadoNuevo: "BORRADOR",
        observacion: "Permiso de trabajo creado",
      },
    });

    // Cuadrilla opcional
    if (input.trabajadores && input.trabajadores.length > 0) {
      if (!companyIdCuadrilla) throw badRequest("No hay empresa para asociar a los trabajadores");
      for (const t of input.trabajadores) {
        const worker = await tx.worker.upsert({
          where: { tenantId_rut: { tenantId: actor.tenantId, rut: t.rut } },
          update: { nombre: t.nombre, ...(t.cargo ? { cargo: t.cargo } : {}) },
          create: {
            tenantId: actor.tenantId,
            rut: t.rut,
            nombre: t.nombre,
            companyId: companyIdCuadrilla,
            ...(t.cargo ? { cargo: t.cargo } : {}),
          },
        });
        await tx.crewSignature.create({
          data: { permitId: permit.id, workerId: worker.id, estadoAcceso: "PENDIENTE_FIRMA" },
        });
      }
    }

    return permit;
  });
}

// ----------------------------------------------------------------
// Lectura (detalle + listado con visibilidad por rol)
// ----------------------------------------------------------------
export async function obtenerPermiso(permitId: string, actor: Actor) {
  // Consultas separadas y secuenciales en vez de un único query con 8 includes:
  // evita abrir demasiadas subconsultas en paralelo (el servidor Prisma Postgres
  // local cierra la conexión por encima de ~6 relaciones anidadas).
  const permit = await prisma.permit.findFirst({
    where: { id: permitId, tenantId: actor.tenantId },
    include: {
      permitType: { select: { nombre: true, prefijo: true, cierreManual: true } },
      plant: { select: { nombre: true, sigla: true } },
      location: { select: { nombre: true } },
      company: { select: { nombre: true, tipo: true } },
      solicitante: { select: { nombre: true, rut: true } },
    },
  });
  if (!permit) throw notFound("Permiso no encontrado");

  const approvals = await prisma.approval.findMany({
    where: { permitId },
    include: { user: { select: { nombre: true } } },
    orderBy: { fecha: "asc" },
  });
  const cuadrilla = await prisma.crewSignature.findMany({
    where: { permitId },
    include: { worker: { select: { rut: true, nombre: true, cargo: true } } },
  });
  const auditoria = await prisma.auditLog.findMany({
    where: { permitId, tenantId: actor.tenantId },
    orderBy: { fecha: "desc" },
    take: 50,
  });

  return { ...permit, approvals, cuadrilla, auditoria };
}

export interface FiltrosPermiso {
  estado?: string;
  limit?: number;
  offset?: number;
}

export async function listarPermisos(actor: Actor, filtros: FiltrosPermiso = {}) {
  const where: Record<string, unknown> = { tenantId: actor.tenantId };
  if (filtros.estado) where["estado"] = filtros.estado;

  // Visibilidad por rol: privilegiados ven todo; el resto ve lo suyo.
  const privilegiado = actor.roles.some((r) => ["ADMIN", "SST", "JEFE_AREA"].includes(r));
  if (!privilegiado) {
    const or: Record<string, unknown>[] = [];
    if (actor.roles.includes("SOLICITANTE")) or.push({ solicitanteId: actor.userId });
    if (actor.roles.includes("CONTRATISTA") && actor.companyId) or.push({ companyId: actor.companyId });
    if (actor.roles.includes("PORTERIA")) or.push({ estado: "ACTIVO" });
    // Si no tiene ningún rol con visibilidad, no ve nada.
    where["OR"] = or.length > 0 ? or : [{ id: "__none__" }];
  }

  return prisma.permit.findMany({
    where,
    select: {
      id: true,
      codigo: true,
      estado: true,
      area: true,
      descripcion: true,
      fechaSolicitud: true,
      fechaVencimiento: true,
      permitType: { select: { nombre: true, prefijo: true } },
      company: { select: { nombre: true } },
      plant: { select: { sigla: true } },
      location: { select: { nombre: true } },
    },
    orderBy: { fechaSolicitud: "desc" },
    take: Math.min(filtros.limit ?? 50, 200),
    skip: filtros.offset ?? 0,
  });
}

// ----------------------------------------------------------------
// Avanzar permiso (MOTOR DE ESTADOS)
// ----------------------------------------------------------------
export async function avanzarPermiso(permitId: string, actor: Actor, input: TransicionInput = {}) {
  const permit = await prisma.permit.findFirst({
    where: { id: permitId, tenantId: actor.tenantId },
    include: {
      company: { select: { tipo: true } },
      workflow: { include: { steps: true } },
    },
  });
  if (!permit) throw notFound("Permiso no encontrado");
  if (esEstadoTerminal(permit.estado)) {
    throw badRequest(`El permiso está en estado terminal (${permit.estado})`);
  }

  const ctx = construirContexto(permit, permit.company);

  // Determinar destino y roles permitidos
  let estadoDestino: string;
  let rolesPermitidos: string[];

  if (permit.estado === "OBSERVADO") {
    // Reanudar: volver al estado desde el que fue devuelto (última DEVOLUCION).
    const ultimaDevolucion = await prisma.auditLog.findFirst({
      where: { permitId: permit.id, tenantId: actor.tenantId, accion: "DEVOLUCION" },
      orderBy: { fecha: "desc" },
      select: { estadoAnterior: true },
    });
    estadoDestino = ultimaDevolucion?.estadoAnterior ?? "PENDIENTE_SST";
    rolesPermitidos = ["CONTRATISTA", "SOLICITANTE", "ADMIN"];
  } else {
    const step = permit.workflow.steps.find((s) => s.estadoDesde === permit.estado);
    if (!step) throw badRequest(`No se puede avanzar desde el estado actual (${permit.estado})`);
    const resultado = resolverTransicion(step, ctx);
    estadoDestino = resultado.estadoDestino;
    rolesPermitidos = resultado.rolesPermitidos;
  }

  // Chequeo de rol
  if (!puedeTransicionar(actor.roles, rolesPermitidos)) {
    throw forbidden(`Sus roles (${actor.roles.join(", ")}) no pueden realizar esta transición`);
  }

  // Chequeo de empresa contratista (solo permisos externos, desde etapa de contratista)
  if (ESTADOS_CONTRATISTA.includes(permit.estado) && !actor.roles.includes("ADMIN")) {
    const esExterno = permit.companyId !== null && permit.company?.tipo === "EXTERNA";
    if (esExterno && String(actor.companyId) !== String(permit.companyId)) {
      throw forbidden("No pertenece a la empresa contratista de este permiso");
    }
  }

  const estadoAnterior = permit.estado;

  return prisma.$transaction(async (tx) => {
    const actualizado = await tx.permit.update({
      where: { id: permit.id },
      data: {
        estado: estadoDestino as PermitStatus,
        ...(estadoDestino === "CERRADO" ? { fechaCierre: new Date() } : {}),
      },
    });

    if (input.firma) {
      await tx.approval.create({
        data: {
          permitId: permit.id,
          userId: actor.userId,
          tipo: input.firma.tipo,
          ...(input.firma.firmaUrl ? { firmaUrl: input.firma.firmaUrl } : {}),
          ...(input.firma.usaPin !== undefined ? { usaPin: input.firma.usaPin } : {}),
          ...(input.firma.gpsLat !== undefined ? { gpsLat: input.firma.gpsLat } : {}),
          ...(input.firma.gpsLng !== undefined ? { gpsLng: input.firma.gpsLng } : {}),
        },
      });
    }

    await tx.auditLog.create({
      data: {
        tenantId: actor.tenantId,
        permitId: permit.id,
        userId: actor.userId,
        accion: "ENVIO",
        estadoAnterior,
        estadoNuevo: estadoDestino,
        observacion: input.observacion ?? "Enviado al siguiente paso",
      },
    });

    return actualizado;
  });
}

// ----------------------------------------------------------------
// Devolver (OBSERVADO) y Rechazar (terminal)
// ----------------------------------------------------------------
const ROLES_REVISION = ["ADMIN", "SST", "JEFE_AREA", "SOLICITANTE"];
const ROLES_RECHAZO = ["ADMIN", "SST", "JEFE_AREA"];
const ROLES_CIERRE_MANUAL = ["ADMIN", "SST", "JEFE_AREA", "SOLICITANTE"];
const ROLES_SUSPENSION = ["ADMIN", "SST"]; // solo prevencionistas / admin

export async function devolverPermiso(permitId: string, motivo: string, actor: Actor) {
  const permit = await prisma.permit.findFirst({
    where: { id: permitId, tenantId: actor.tenantId },
    select: { id: true, estado: true },
  });
  if (!permit) throw notFound("Permiso no encontrado");
  if (permit.estado === "BORRADOR" || esEstadoTerminal(permit.estado) || permit.estado === "OBSERVADO") {
    throw badRequest(`No se puede devolver un permiso en estado ${permit.estado}`);
  }
  if (!actor.roles.includes("ADMIN") && !actor.roles.some((r) => ROLES_REVISION.includes(r))) {
    throw forbidden("Sus roles no pueden devolver permisos");
  }

  return prisma.$transaction(async (tx) => {
    const actualizado = await tx.permit.update({ where: { id: permit.id }, data: { estado: "OBSERVADO" } });
    await tx.auditLog.create({
      data: {
        tenantId: actor.tenantId,
        permitId: permit.id,
        userId: actor.userId,
        accion: "DEVOLUCION",
        estadoAnterior: permit.estado,
        estadoNuevo: "OBSERVADO",
        observacion: motivo,
      },
    });
    return actualizado;
  });
}

/**
 * Cierre manual anticipado (cuando el trabajo termina antes de vencer).
 * Solo para tipos SIN cierre formal con firmas (G/C). El Caliente cierra por su
 * flujo de firmas (vía `avanzarPermiso`).
 */
export async function cerrarPermiso(permitId: string, actor: Actor, observacion?: string) {
  const permit = await prisma.permit.findFirst({
    where: { id: permitId, tenantId: actor.tenantId },
    select: { id: true, estado: true, permitType: { select: { cierreManual: true } } },
  });
  if (!permit) throw notFound("Permiso no encontrado");
  if (permit.estado !== "ACTIVO") throw badRequest(`Solo se puede cerrar un permiso ACTIVO (está ${permit.estado})`);
  if (permit.permitType.cierreManual) {
    throw badRequest("Este tipo usa el flujo de cierre con firmas; usá las transiciones de cierre");
  }
  if (!actor.roles.includes("ADMIN") && !actor.roles.some((r) => ROLES_CIERRE_MANUAL.includes(r))) {
    throw forbidden("Sus roles no pueden cerrar el permiso");
  }

  return prisma.$transaction(async (tx) => {
    const actualizado = await tx.permit.update({
      where: { id: permit.id },
      data: { estado: "CERRADO", fechaCierre: new Date() },
    });
    await tx.auditLog.create({
      data: {
        tenantId: actor.tenantId,
        permitId: permit.id,
        userId: actor.userId,
        accion: "CIERRE_MANUAL",
        estadoAnterior: "ACTIVO",
        estadoNuevo: "CERRADO",
        observacion: observacion ?? "Cierre manual anticipado (trabajo finalizado)",
      },
    });
    return actualizado;
  });
}

/**
 * Suspender un permiso activo (acción de seguridad del prevencionista): el
 * trabajo queda detenido hasta corregir las condiciones. Solo SST/Admin.
 */
export async function suspenderPermiso(permitId: string, motivo: string, actor: Actor) {
  const permit = await prisma.permit.findFirst({
    where: { id: permitId, tenantId: actor.tenantId },
    select: { id: true, estado: true },
  });
  if (!permit) throw notFound("Permiso no encontrado");
  if (permit.estado !== "ACTIVO") throw badRequest(`Solo se puede suspender un permiso ACTIVO (está ${permit.estado})`);
  if (!actor.roles.includes("ADMIN") && !actor.roles.some((r) => ROLES_SUSPENSION.includes(r))) {
    throw forbidden("Solo el prevencionista (SST) o un administrador pueden suspender un permiso");
  }

  return prisma.$transaction(async (tx) => {
    const actualizado = await tx.permit.update({ where: { id: permit.id }, data: { estado: "SUSPENDIDO" } });
    await tx.auditLog.create({
      data: {
        tenantId: actor.tenantId,
        permitId: permit.id,
        userId: actor.userId,
        accion: "SUSPENSION",
        estadoAnterior: "ACTIVO",
        estadoNuevo: "SUSPENDIDO",
        observacion: motivo,
      },
    });
    return actualizado;
  });
}

/** Reactivar un permiso suspendido una vez corregidas las condiciones. Solo SST/Admin. */
export async function reactivarPermiso(permitId: string, actor: Actor, observacion?: string) {
  const permit = await prisma.permit.findFirst({
    where: { id: permitId, tenantId: actor.tenantId },
    select: { id: true, estado: true },
  });
  if (!permit) throw notFound("Permiso no encontrado");
  if (permit.estado !== "SUSPENDIDO") throw badRequest(`Solo se puede reactivar un permiso SUSPENDIDO (está ${permit.estado})`);
  if (!actor.roles.includes("ADMIN") && !actor.roles.some((r) => ROLES_SUSPENSION.includes(r))) {
    throw forbidden("Solo el prevencionista (SST) o un administrador pueden reactivar un permiso");
  }

  return prisma.$transaction(async (tx) => {
    const actualizado = await tx.permit.update({ where: { id: permit.id }, data: { estado: "ACTIVO" } });
    await tx.auditLog.create({
      data: {
        tenantId: actor.tenantId,
        permitId: permit.id,
        userId: actor.userId,
        accion: "REACTIVACION",
        estadoAnterior: "SUSPENDIDO",
        estadoNuevo: "ACTIVO",
        observacion: observacion ?? "Permiso reactivado tras corregir condiciones",
      },
    });
    return actualizado;
  });
}

export async function rechazarPermiso(permitId: string, motivo: string, actor: Actor) {
  const permit = await prisma.permit.findFirst({
    where: { id: permitId, tenantId: actor.tenantId },
    select: { id: true, estado: true },
  });
  if (!permit) throw notFound("Permiso no encontrado");
  if (esEstadoTerminal(permit.estado)) throw badRequest(`El permiso ya está en estado terminal (${permit.estado})`);
  if (!actor.roles.includes("ADMIN") && !actor.roles.some((r) => ROLES_RECHAZO.includes(r))) {
    throw forbidden("Sus roles no pueden rechazar permisos");
  }

  return prisma.$transaction(async (tx) => {
    const actualizado = await tx.permit.update({ where: { id: permit.id }, data: { estado: "RECHAZADO" } });
    await tx.auditLog.create({
      data: {
        tenantId: actor.tenantId,
        permitId: permit.id,
        userId: actor.userId,
        accion: "RECHAZO",
        estadoAnterior: permit.estado,
        estadoNuevo: "RECHAZADO",
        observacion: motivo,
      },
    });
    return actualizado;
  });
}
