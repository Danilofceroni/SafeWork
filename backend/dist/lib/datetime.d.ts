export interface ReglaVigencia {
    /** Días de vigencia (1 = mismo día, 7 = una semana, etc.) */
    vigenciaDias: number;
    /** Si true, vence el último día del mes de la fecha de inicio (RN-05). */
    vigenciaHastaFinDeMes: boolean;
}
/**
 * Convierte una fecha de entrada (ISO `YYYY-MM-DD`, `DD/MM/YYYY` o Date) al
 * inicio del día en el timezone del tenant. Devuelve null si es inválida.
 */
export declare function parseFechaInicio(input: string | Date, timezone: string): Date | null;
/**
 * Calcula la fecha de vencimiento a partir de la fecha de inicio y la regla de
 * vigencia del tipo de permiso, en el timezone del tenant.
 *
 * - `vigenciaHastaFinDeMes`: vence el último día del mes a las 23:59:59.999.
 * - en otro caso: vence en `fechaInicio + (vigenciaDias - 1)` a las 23:59:59.999,
 *   pero nunca cruza el mes (RN-05): si la fecha calculada cae en otro mes, se
 *   recorta al último día del mes de inicio.
 */
export declare function calcularVencimiento(fechaInicio: Date, regla: ReglaVigencia, timezone: string): Date;
/** Año actual en el timezone del tenant (para el código del permiso). */
export declare function anioActual(timezone: string): number;
//# sourceMappingURL=datetime.d.ts.map