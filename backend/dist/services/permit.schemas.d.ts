/**
 * Validación de entrada (Zod). Compartibles con el frontend en el futuro.
 */
import { z } from "zod";
export declare const crearPermisoSchema: z.ZodObject<{
    permitTypeId: z.ZodString;
    plantId: z.ZodString;
    locationId: z.ZodString;
    area: z.ZodEnum<{
        TIERRA: "TIERRA";
        FLOTA: "FLOTA";
    }>;
    descripcion: z.ZodString;
    fechaInicio: z.ZodString;
    companyId: z.ZodOptional<z.ZodString>;
    permisoPadreId: z.ZodOptional<z.ZodString>;
    codigoCartaFuego: z.ZodOptional<z.ZodString>;
    riesgos: z.ZodOptional<z.ZodArray<z.ZodString>>;
    trabajadores: z.ZodOptional<z.ZodArray<z.ZodObject<{
        rut: z.ZodString;
        nombre: z.ZodString;
        cargo: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type CrearPermisoInput = z.infer<typeof crearPermisoSchema>;
export declare const transicionSchema: z.ZodObject<{
    firma: z.ZodOptional<z.ZodObject<{
        tipo: z.ZodString;
        firmaUrl: z.ZodOptional<z.ZodString>;
        usaPin: z.ZodOptional<z.ZodBoolean>;
        gpsLat: z.ZodOptional<z.ZodNumber>;
        gpsLng: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    observacion: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type TransicionInput = z.infer<typeof transicionSchema>;
export declare const devolverSchema: z.ZodObject<{
    motivo: z.ZodString;
}, z.core.$strip>;
export declare const rechazarSchema: z.ZodObject<{
    motivo: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=permit.schemas.d.ts.map