/**
 * Validación de entrada (Zod). Compartibles con el frontend en el futuro.
 */
import { z } from "zod";
export const crearPermisoSchema = z.object({
    permitTypeId: z.string().min(1),
    plantId: z.string().min(1),
    locationId: z.string().min(1),
    area: z.enum(["TIERRA", "FLOTA"]),
    descripcion: z.string().min(3),
    fechaInicio: z.string().min(1), // ISO YYYY-MM-DD o DD/MM/YYYY (se valida al parsear)
    companyId: z.string().optional(),
    permisoPadreId: z.string().optional(),
    codigoCartaFuego: z.string().regex(/^\d{7}$/).optional(),
    riesgos: z.array(z.string()).optional(),
    trabajadores: z
        .array(z.object({ rut: z.string().min(1), nombre: z.string().min(1), cargo: z.string().optional() }))
        .optional(),
});
export const transicionSchema = z.object({
    /** Firma opcional registrada junto a la transición (autorización SST, etc.). */
    firma: z
        .object({
        tipo: z.string().min(1),
        firmaUrl: z.string().optional(),
        usaPin: z.boolean().optional(),
        gpsLat: z.number().optional(),
        gpsLng: z.number().optional(),
    })
        .optional(),
    observacion: z.string().optional(),
});
export const devolverSchema = z.object({ motivo: z.string().min(3) });
export const rechazarSchema = z.object({ motivo: z.string().min(3) });
//# sourceMappingURL=permit.schemas.js.map