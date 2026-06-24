/** Estados terminales: desde aquí no se avanza por el flujo normal. */
export const ESTADOS_TERMINALES = ["RECHAZADO", "CERRADO", "VENCIDO"];
/** Rutas soportadas en el lado izquierdo de una condición de salto. */
export const RUTAS_CONDICION = ["empresa.tipo", "area"];
/**
 * Construye el contexto de evaluación para un permiso.
 * Nota de dominio: un permiso sin empresa contratista se considera INTERNO
 * (interno = sin empresa o empresa tipo INTERNA).
 */
export function construirContexto(permit, empresa) {
    return { empresa, area: permit.area };
}
/**
 * Resuelve un valor del contexto a partir de una ruta tipo "empresa.tipo".
 * Si no hay empresa, "empresa.tipo" devuelve "INTERNA" (permiso interno).
 */
function resolverValor(ruta, ctx) {
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
export function evaluarCondicion(condicion, ctx) {
    const m = condicion.match(/^\s*([\w.]+)\s*(==|!=)\s*(.+?)\s*$/);
    if (!m)
        return false;
    const [, ruta, operador, esperadoRaw] = m;
    if (!ruta || !operador || esperadoRaw === undefined)
        return false;
    const actual = resolverValor(ruta, ctx);
    const esperado = esperadoRaw.replace(/^["']|["']$/g, ""); // quita comillas opcionales
    return operador === "==" ? actual === esperado : actual !== esperado;
}
/**
 * Valida el formato de una condición de salto y que use una ruta soportada.
 * Lo usa el validador de workflows antes de permitir guardar una configuración.
 */
export function condicionValida(condicion) {
    const m = condicion.match(/^\s*([\w.]+)\s*(==|!=)\s*(.+?)\s*$/);
    if (!m)
        return false;
    return RUTAS_CONDICION.includes(m[1] ?? "");
}
/**
 * Dado el paso del workflow y el contexto, determina el estado destino,
 * aplicando el salto declarativo si su condición se cumple (RN-10).
 */
export function resolverTransicion(step, ctx) {
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
export function puedeTransicionar(rolesUsuario, rolesPermitidos) {
    if (rolesUsuario.includes("ADMIN"))
        return true;
    return rolesUsuario.some((r) => rolesPermitidos.includes(r));
}
export function esEstadoTerminal(estado) {
    return ESTADOS_TERMINALES.includes(estado);
}
//# sourceMappingURL=workflow.engine.js.map