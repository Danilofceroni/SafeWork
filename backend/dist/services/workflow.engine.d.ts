/**
 * Motor de estados declarativo.
 *
 * Resuelve las transiciones leyendo las filas de `WorkflowStep` en lugar de
 * tener el flujo escrito en el código. Así, cada tenant define su propio flujo
 * (cuántas firmas, qué roles, qué saltos) sin tocar el motor.
 */
import type { Company, Permit, WorkflowStep } from "../../generated/prisma/index.js";
/** Estados terminales: desde aquí no se avanza por el flujo normal. */
export declare const ESTADOS_TERMINALES: readonly ["RECHAZADO", "CERRADO", "VENCIDO"];
/** Rutas soportadas en el lado izquierdo de una condición de salto. */
export declare const RUTAS_CONDICION: readonly ["empresa.tipo", "area"];
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
export declare function construirContexto(permit: Pick<Permit, "area">, empresa: Pick<Company, "tipo"> | null): ContextoCondicion;
/**
 * Evalúa una condición de salto declarativa.
 * Formato soportado: `"<ruta>==<valor>"` o `"<ruta>!=<valor>"`.
 * Ej: "empresa.tipo==INTERNA", "area==FLOTA".
 */
export declare function evaluarCondicion(condicion: string, ctx: ContextoCondicion): boolean;
/**
 * Valida el formato de una condición de salto y que use una ruta soportada.
 * Lo usa el validador de workflows antes de permitir guardar una configuración.
 */
export declare function condicionValida(condicion: string): boolean;
export interface ResultadoTransicion {
    estadoDestino: string;
    rolesPermitidos: string[];
    saltoAplicado: boolean;
}
/**
 * Dado el paso del workflow y el contexto, determina el estado destino,
 * aplicando el salto declarativo si su condición se cumple (RN-10).
 */
export declare function resolverTransicion(step: Pick<WorkflowStep, "estadoHasta" | "rolesPermitidos" | "condicionSalto" | "estadoHastaSalto">, ctx: ContextoCondicion): ResultadoTransicion;
/** ADMIN siempre puede; en otro caso el usuario debe tener un rol permitido. */
export declare function puedeTransicionar(rolesUsuario: string[], rolesPermitidos: string[]): boolean;
export declare function esEstadoTerminal(estado: string): boolean;
//# sourceMappingURL=workflow.engine.d.ts.map