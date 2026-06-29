/**
 * Motor de estados declarativo.
 *
 * Resuelve las transiciones leyendo las filas de `WorkflowStep` en lugar de
 * tener el flujo escrito en el código. Así, cada tenant define su propio flujo
 * (cuántas firmas, qué roles, qué saltos) sin tocar el motor.
 */
import type { Company, Permit, WorkflowStep } from "../../generated/prisma/index.js";

/** Estados terminales: desde aquí no se avanza por el flujo normal. */
export const ESTADOS_TERMINALES = ["RECHAZADO", "CERRADO", "VENCIDO"] as const;

/** Rutas soportadas en el lado izquierdo de una condición de salto. */
export const RUTAS_CONDICION = ["empresa.tipo", "area"] as const;

/** Contexto contra el que se evalúan las condiciones de salto. */
export interface ContextoCondicion {
  empresa: Pick<Company, "tipo"> | null;
  area: string;
}

/**
 * Construye el contexto de evaluación para un permiso.
 * Nota de dominio: un permiso sin empresa contratista se considera INTERNO
 * (interno = sin empresa o empresa tipo INTERNA).
 */
export function construirContexto(
  permit: Pick<Permit, "area">,
  empresa: Pick<Company, "tipo"> | null,
): ContextoCondicion {
  return { empresa, area: permit.area };
}

/**
 * Resuelve un valor del contexto a partir de una ruta tipo "empresa.tipo".
 * Si no hay empresa, "empresa.tipo" devuelve "INTERNA" (permiso interno).
 */
function resolverValor(ruta: string, ctx: ContextoCondicion): string | null {
  switch (ruta) {
    case "empresa.tipo":
      return ctx.empresa?.tipo ?? "INTERNA";
    case "area":
      return ctx.area;
    default:
      return null;
  }
}

/**
 * Evalúa una condición de salto declarativa.
 * Formato soportado: `"<ruta>==<valor>"` o `"<ruta>!=<valor>"`.
 * Ej: "empresa.tipo==INTERNA", "area==FLOTA".
 */
export function evaluarCondicion(condicion: string, ctx: ContextoCondicion): boolean {
  const m = condicion.match(/^\s*([\w.]+)\s*(==|!=)\s*(.+?)\s*$/);
  if (!m) return false;
  const [, ruta, operador, esperadoRaw] = m;
  if (!ruta || !operador || esperadoRaw === undefined) return false;

  const actual = resolverValor(ruta, ctx);
  const esperado = esperadoRaw.replace(/^["']|["']$/g, ""); // quita comillas opcionales

  return operador === "==" ? actual === esperado : actual !== esperado;
}

/**
 * Valida el formato de una condición de salto y que use una ruta soportada.
 * Lo usa el validador de workflows antes de permitir guardar una configuración.
 */
export function condicionValida(condicion: string): boolean {
  const m = condicion.match(/^\s*([\w.]+)\s*(==|!=)\s*(.+?)\s*$/);
  if (!m) return false;
  return (RUTAS_CONDICION as readonly string[]).includes(m[1] ?? "");
}

export interface ResultadoTransicion {
  estadoDestino: string;
  rolesPermitidos: string[];
  saltoAplicado: boolean;
}

/**
 * Dado el paso del workflow y el contexto, determina el estado destino,
 * aplicando el salto declarativo si su condición se cumple (RN-10).
 */
export function resolverTransicion(
  step: Pick<WorkflowStep, "estadoHasta" | "rolesPermitidos" | "condicionSalto" | "estadoHastaSalto">,
  ctx: ContextoCondicion,
): ResultadoTransicion {
  if (step.condicionSalto && step.estadoHastaSalto && evaluarCondicion(step.condicionSalto, ctx)) {
    return {
      estadoDestino: step.estadoHastaSalto,
      rolesPermitidos: step.rolesPermitidos,
      saltoAplicado: true,
    };
  }
  return {
    estadoDestino: step.estadoHasta,
    rolesPermitidos: step.rolesPermitidos,
    saltoAplicado: false,
  };
}

/** ADMIN siempre puede; en otro caso el usuario debe tener un rol permitido. */
export function puedeTransicionar(rolesUsuario: string[], rolesPermitidos: string[]): boolean {
  if (rolesUsuario.includes("ADMIN")) return true;
  return rolesUsuario.some((r) => rolesPermitidos.includes(r));
}

export function esEstadoTerminal(estado: string): boolean {
  return (ESTADOS_TERMINALES as readonly string[]).includes(estado);
}
