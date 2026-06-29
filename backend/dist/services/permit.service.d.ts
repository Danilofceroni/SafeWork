import type { CrearPermisoInput, TransicionInput } from "./permit.schemas.js";
/** Identidad del usuario que ejecuta la acción (vendrá del JWT en Fase 2b). */
export interface Actor {
    tenantId: string;
    userId: string;
    roles: string[];
    companyId?: string | null;
}
export declare function crearPermiso(input: CrearPermisoInput, actor: Actor): Promise<{
    tenantId: string;
    companyId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    codigo: string;
    permitTypeId: string;
    plantId: string;
    locationId: string;
    area: import("../../generated/prisma/index.js").$Enums.Area;
    descripcion: string;
    fechaInicio: Date;
    permisoPadreId: string | null;
    codigoCartaFuego: string | null;
    riesgos: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    workflowId: string;
    solicitanteId: string;
    estado: import("../../generated/prisma/index.js").$Enums.PermitStatus;
    fechaSolicitud: Date;
    fechaVencimiento: Date;
    fechaCierre: Date | null;
    datosFormularios: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    alertasEnviadas: string[];
}>;
export declare function obtenerPermiso(permitId: string, actor: Actor): Promise<{
    approvals: ({
        user: {
            nombre: string;
        };
    } & {
        id: string;
        userId: string;
        tipo: string;
        firmaUrl: string | null;
        usaPin: boolean;
        gpsLat: number | null;
        gpsLng: number | null;
        permitId: string;
        fecha: Date;
    })[];
    cuadrilla: ({
        worker: {
            rut: string;
            nombre: string;
            cargo: string | null;
        };
    } & {
        id: string;
        firmaUrl: string | null;
        permitId: string;
        workerId: string;
        estadoAcceso: import("../../generated/prisma/index.js").$Enums.CrewStatus;
        fechaFirma: Date | null;
        fechaIngreso: Date | null;
        fechaSalida: Date | null;
    })[];
    auditoria: {
        tenantId: string;
        id: string;
        userId: string | null;
        observacion: string | null;
        permitId: string | null;
        fecha: Date;
        accion: string;
        estadoAnterior: string | null;
        estadoNuevo: string | null;
        ip: string | null;
        userAgent: string | null;
        gps: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    }[];
    company: {
        nombre: string;
        tipo: import("../../generated/prisma/index.js").$Enums.CompanyType;
    } | null;
    permitType: {
        nombre: string;
        prefijo: string;
        cierreManual: boolean;
    };
    solicitante: {
        rut: string;
        nombre: string;
    };
    plant: {
        nombre: string;
        sigla: string;
    };
    location: {
        nombre: string;
    };
    tenantId: string;
    companyId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    codigo: string;
    permitTypeId: string;
    plantId: string;
    locationId: string;
    area: import("../../generated/prisma/index.js").$Enums.Area;
    descripcion: string;
    fechaInicio: Date;
    permisoPadreId: string | null;
    codigoCartaFuego: string | null;
    riesgos: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    workflowId: string;
    solicitanteId: string;
    estado: import("../../generated/prisma/index.js").$Enums.PermitStatus;
    fechaSolicitud: Date;
    fechaVencimiento: Date;
    fechaCierre: Date | null;
    datosFormularios: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    alertasEnviadas: string[];
}>;
export interface FiltrosPermiso {
    estado?: string;
    limit?: number;
    offset?: number;
}
export declare function listarPermisos(actor: Actor, filtros?: FiltrosPermiso): Promise<{
    id: string;
    company: {
        nombre: string;
    } | null;
    codigo: string;
    area: import("../../generated/prisma/index.js").$Enums.Area;
    descripcion: string;
    estado: import("../../generated/prisma/index.js").$Enums.PermitStatus;
    fechaSolicitud: Date;
    fechaVencimiento: Date;
    permitType: {
        nombre: string;
        prefijo: string;
    };
    plant: {
        sigla: string;
    };
    location: {
        nombre: string;
    };
}[]>;
export declare function avanzarPermiso(permitId: string, actor: Actor, input?: TransicionInput): Promise<{
    tenantId: string;
    companyId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    codigo: string;
    permitTypeId: string;
    plantId: string;
    locationId: string;
    area: import("../../generated/prisma/index.js").$Enums.Area;
    descripcion: string;
    fechaInicio: Date;
    permisoPadreId: string | null;
    codigoCartaFuego: string | null;
    riesgos: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    workflowId: string;
    solicitanteId: string;
    estado: import("../../generated/prisma/index.js").$Enums.PermitStatus;
    fechaSolicitud: Date;
    fechaVencimiento: Date;
    fechaCierre: Date | null;
    datosFormularios: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    alertasEnviadas: string[];
}>;
export declare function devolverPermiso(permitId: string, motivo: string, actor: Actor): Promise<{
    tenantId: string;
    companyId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    codigo: string;
    permitTypeId: string;
    plantId: string;
    locationId: string;
    area: import("../../generated/prisma/index.js").$Enums.Area;
    descripcion: string;
    fechaInicio: Date;
    permisoPadreId: string | null;
    codigoCartaFuego: string | null;
    riesgos: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    workflowId: string;
    solicitanteId: string;
    estado: import("../../generated/prisma/index.js").$Enums.PermitStatus;
    fechaSolicitud: Date;
    fechaVencimiento: Date;
    fechaCierre: Date | null;
    datosFormularios: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    alertasEnviadas: string[];
}>;
/**
 * Cierre manual anticipado (cuando el trabajo termina antes de vencer).
 * Solo para tipos SIN cierre formal con firmas (G/C). El Caliente cierra por su
 * flujo de firmas (vía `avanzarPermiso`).
 */
export declare function cerrarPermiso(permitId: string, actor: Actor, observacion?: string): Promise<{
    tenantId: string;
    companyId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    codigo: string;
    permitTypeId: string;
    plantId: string;
    locationId: string;
    area: import("../../generated/prisma/index.js").$Enums.Area;
    descripcion: string;
    fechaInicio: Date;
    permisoPadreId: string | null;
    codigoCartaFuego: string | null;
    riesgos: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    workflowId: string;
    solicitanteId: string;
    estado: import("../../generated/prisma/index.js").$Enums.PermitStatus;
    fechaSolicitud: Date;
    fechaVencimiento: Date;
    fechaCierre: Date | null;
    datosFormularios: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    alertasEnviadas: string[];
}>;
/**
 * Suspender un permiso activo (acción de seguridad del prevencionista): el
 * trabajo queda detenido hasta corregir las condiciones. Solo SST/Admin.
 */
export declare function suspenderPermiso(permitId: string, motivo: string, actor: Actor): Promise<{
    tenantId: string;
    companyId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    codigo: string;
    permitTypeId: string;
    plantId: string;
    locationId: string;
    area: import("../../generated/prisma/index.js").$Enums.Area;
    descripcion: string;
    fechaInicio: Date;
    permisoPadreId: string | null;
    codigoCartaFuego: string | null;
    riesgos: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    workflowId: string;
    solicitanteId: string;
    estado: import("../../generated/prisma/index.js").$Enums.PermitStatus;
    fechaSolicitud: Date;
    fechaVencimiento: Date;
    fechaCierre: Date | null;
    datosFormularios: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    alertasEnviadas: string[];
}>;
/** Reactivar un permiso suspendido una vez corregidas las condiciones. Solo SST/Admin. */
export declare function reactivarPermiso(permitId: string, actor: Actor, observacion?: string): Promise<{
    tenantId: string;
    companyId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    codigo: string;
    permitTypeId: string;
    plantId: string;
    locationId: string;
    area: import("../../generated/prisma/index.js").$Enums.Area;
    descripcion: string;
    fechaInicio: Date;
    permisoPadreId: string | null;
    codigoCartaFuego: string | null;
    riesgos: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    workflowId: string;
    solicitanteId: string;
    estado: import("../../generated/prisma/index.js").$Enums.PermitStatus;
    fechaSolicitud: Date;
    fechaVencimiento: Date;
    fechaCierre: Date | null;
    datosFormularios: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    alertasEnviadas: string[];
}>;
export declare function rechazarPermiso(permitId: string, motivo: string, actor: Actor): Promise<{
    tenantId: string;
    companyId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    codigo: string;
    permitTypeId: string;
    plantId: string;
    locationId: string;
    area: import("../../generated/prisma/index.js").$Enums.Area;
    descripcion: string;
    fechaInicio: Date;
    permisoPadreId: string | null;
    codigoCartaFuego: string | null;
    riesgos: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    workflowId: string;
    solicitanteId: string;
    estado: import("../../generated/prisma/index.js").$Enums.PermitStatus;
    fechaSolicitud: Date;
    fechaVencimiento: Date;
    fechaCierre: Date | null;
    datosFormularios: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    alertasEnviadas: string[];
}>;
//# sourceMappingURL=permit.service.d.ts.map