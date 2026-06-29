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
/** Valida una configuración de flujo (función pura, testeable sin BD). */
export declare function validarWorkflow(pasos: PasoConfig[], opts: OpcionesValidacion): ResultadoValidacion;
/** Valida un workflow existente en la BD (acotado al tenant). */
export declare function validarWorkflowEnBD(workflowId: string, tenantId: string): Promise<ResultadoValidacion>;
//# sourceMappingURL=workflow.validator.d.ts.map