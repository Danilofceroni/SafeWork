/**
 * Cálculo de fechas de vencimiento, respetando el timezone del tenant.
 *
 * Usa Luxon para el manejo de zonas horarias. La regla de vigencia se deriva de
 * la configuración del tipo de permiso (`PermitType`), no de `if` por tipo G/C/H.
 */
import { DateTime } from "luxon";

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
export function parseFechaInicio(input: string | Date, timezone: string): Date | null {
  let dt: DateTime;

  if (input instanceof Date) {
    dt = DateTime.fromJSDate(input, { zone: timezone });
  } else {
    const text = input.trim();
    // ISO corto / completo
    dt = DateTime.fromISO(text, { zone: timezone });
    // Formato latino DD/MM/YYYY
    if (!dt.isValid) {
      dt = DateTime.fromFormat(text, "dd/MM/yyyy", { zone: timezone });
    }
  }

  if (!dt.isValid) return null;
  return dt.startOf("day").toJSDate();
}

/**
 * Calcula la fecha de vencimiento a partir de la fecha de inicio y la regla de
 * vigencia del tipo de permiso, en el timezone del tenant.
 *
 * - `vigenciaHastaFinDeMes`: vence el último día del mes a las 23:59:59.999.
 * - en otro caso: vence en `fechaInicio + (vigenciaDias - 1)` a las 23:59:59.999,
 *   pero nunca cruza el mes (RN-05): si la fecha calculada cae en otro mes, se
 *   recorta al último día del mes de inicio.
 */
export function calcularVencimiento(
  fechaInicio: Date,
  regla: ReglaVigencia,
  timezone: string,
): Date {
  const start = DateTime.fromJSDate(fechaInicio, { zone: timezone });
  const finDeMes = start.endOf("month");

  if (regla.vigenciaHastaFinDeMes) {
    return finDeMes.toJSDate();
  }

  const dias = Math.max(1, regla.vigenciaDias);
  let candidata = start.plus({ days: dias - 1 }).endOf("day");

  if (candidata > finDeMes) {
    candidata = finDeMes; // RN-05: no cruzar el mes
  }

  return candidata.toJSDate();
}

/** Año actual en el timezone del tenant (para el código del permiso). */
export function anioActual(timezone: string): number {
  return DateTime.now().setZone(timezone).year;
}
