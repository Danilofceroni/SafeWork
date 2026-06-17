/**
 * Validador de workflows — la "baranda" del modelo híbrido.
 *
 * Permite que cada tenant ajuste su flujo (reordenar/añadir/quitar pasos,
 * asignar roles, definir saltos) pero rechaza configuraciones inválidas antes
 * de guardarlas. El vocabulario de estados es fijo (`PermitStatus`); aquí se
 * valida la "gramática": que el grafo de estados sea coherente.
 */
import { PermitStatus } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { notFound } from "../lib/errors.js";
import { ESTADOS_TERMINALES, condicionValida } from "./workflow.engine.js";

export interface PasoConfig {
  orden: number;
  estadoDesde: string;
  estadoHasta: string;
  rolesPermitidos: string[];
  condicionSalto?: string | null;
  estadoHastaSalto?: string | null;
}

export interface OpcionesValidacion {
  /** Si algún tipo de permiso que usa este flujo requiere cierre manual. */
  cierreManual: boolean;
  /** Códigos de rol existentes en el tenant. */
  rolesValidos: string[];
}

export interface ResultadoValidacion {
  valido: boolean;
  errores: string[];
  advertencias: string[];
}

const ESTADO_INICIAL = "BORRADOR";
const ESTADO_ACTIVO = "ACTIVO";
const ESTADO_CERRADO = "CERRADO";
// OBSERVADO y SUSPENDIDO se alcanzan vía acciones del motor (devolver / suspender),
// no por un WorkflowStep: no se les exige tener un paso de salida.
const SIN_SALIDA_PERMITIDA = new Set<string>([...ESTADOS_TERMINALES, "OBSERVADO", "SUSPENDIDO"]);

/** Valida una configuración de flujo (función pura, testeable sin BD). */
export function validarWorkflow(pasos: PasoConfig[], opts: OpcionesValidacion): ResultadoValidacion {
  const errores: string[] = [];
  const advertencias: string[] = [];
  const estadosValidos = new Set<string>(Object.values(PermitStatus));

  if (pasos.length === 0) {
    return { valido: false, errores: ["El flujo no tiene pasos."], advertencias };
  }

  // 1. Origen único por paso (la BD lo exige, pero validamos la config previa)
  const origenes = new Set<string>();
  for (const p of pasos) {
    if (origenes.has(p.estadoDesde)) errores.push(`Hay más de un paso que sale de "${p.estadoDesde}".`);
    origenes.add(p.estadoDesde);
  }

  // 2. Estados válidos, roles y condiciones por paso
  for (const p of pasos) {
    if (!estadosValidos.has(p.estadoDesde)) errores.push(`Estado de origen inválido: "${p.estadoDesde}".`);
    if (!estadosValidos.has(p.estadoHasta)) errores.push(`Estado destino inválido: "${p.estadoHasta}".`);

    if (p.rolesPermitidos.length === 0) {
      errores.push(`El paso desde "${p.estadoDesde}" no tiene roles permitidos (sería inejecutable).`);
    } else {
      for (const r of p.rolesPermitidos) {
        if (!opts.rolesValidos.includes(r)) errores.push(`Rol inexistente en el paso "${p.estadoDesde}": "${r}".`);
      }
    }

    if (p.condicionSalto) {
      if (!p.estadoHastaSalto) {
        errores.push(`El paso "${p.estadoDesde}" tiene condición de salto pero no define estado de salto.`);
      } else if (!estadosValidos.has(p.estadoHastaSalto)) {
        errores.push(`Estado de salto inválido en "${p.estadoDesde}": "${p.estadoHastaSalto}".`);
      }
      if (!condicionValida(p.condicionSalto)) {
        errores.push(`Condición de salto no soportada en "${p.estadoDesde}": "${p.condicionSalto}".`);
      }
    } else if (p.estadoHastaSalto) {
      advertencias.push(`El paso "${p.estadoDesde}" define estado de salto sin condición; será ignorado.`);
    }
  }

  // 3. Punto de entrada
  if (!origenes.has(ESTADO_INICIAL)) {
    errores.push(`Falta el paso inicial desde "${ESTADO_INICIAL}".`);
  }

  // 4. Alcanzabilidad (BFS desde BORRADOR siguiendo destino y salto)
  const alcanzables = new Set<string>();
  const cola: string[] = [ESTADO_INICIAL];
  while (cola.length > 0) {
    const nodo = cola.shift() as string;
    if (alcanzables.has(nodo)) continue;
    alcanzables.add(nodo);
    for (const p of pasos) {
      if (p.estadoDesde !== nodo) continue;
      for (const destino of [p.estadoHasta, p.estadoHastaSalto]) {
        if (destino && !alcanzables.has(destino)) cola.push(destino);
      }
    }
  }

  if (!alcanzables.has(ESTADO_ACTIVO)) {
    errores.push(`No existe un camino desde "${ESTADO_INICIAL}" hasta "${ESTADO_ACTIVO}".`);
  }
  if (opts.cierreManual && !alcanzables.has(ESTADO_CERRADO)) {
    errores.push(`El tipo requiere cierre manual pero no hay camino hasta "${ESTADO_CERRADO}".`);
  }

  // 5. Sin callejones sin salida
  const sinSalidaOk = new Set(SIN_SALIDA_PERMITIDA);
  if (!opts.cierreManual) sinSalidaOk.add(ESTADO_ACTIVO); // sin cierre manual, ACTIVO lo cierra el job
  for (const estado of alcanzables) {
    if (sinSalidaOk.has(estado)) continue;
    if (!origenes.has(estado)) errores.push(`Estado sin salida (callejón sin salida): "${estado}".`);
  }

  return { valido: errores.length === 0, errores, advertencias };
}

/** Valida un workflow existente en la BD (acotado al tenant). */
export async function validarWorkflowEnBD(workflowId: string, tenantId: string): Promise<ResultadoValidacion> {
  const wf = await prisma.workflow.findFirst({
    where: { id: workflowId, tenantId },
    include: { steps: true, permitTypes: { select: { cierreManual: true } } },
  });
  if (!wf) throw notFound("Workflow no encontrado");

  const cierreManual = wf.permitTypes.some((pt) => pt.cierreManual);
  const roles = await prisma.role.findMany({ where: { tenantId }, select: { codigo: true } });

  return validarWorkflow(wf.steps, { cierreManual, rolesValidos: roles.map((r) => r.codigo) });
}
