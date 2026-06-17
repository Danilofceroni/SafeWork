// Tipos compartidos con el backend (espejo de las respuestas de la API).

export type PermitStatus =
  | "BORRADOR"
  | "PENDIENTE_CONTRATISTA"
  | "PENDIENTE_SOLICITANTE"
  | "PENDIENTE_JEFE_AREA"
  | "PENDIENTE_SST"
  | "ACTIVO"
  | "SUSPENDIDO"
  | "PENDIENTE_CIERRE_SOLICITANTE"
  | "PENDIENTE_CIERRE_JEFE_AREA"
  | "OBSERVADO"
  | "RECHAZADO"
  | "CERRADO"
  | "VENCIDO";

export interface AuthUser {
  id: string;
  rut: string;
  nombre: string;
  roles: string[];
  tenantId: string;
  companyId: string | null;
}

export interface PermitListItem {
  id: string;
  codigo: string;
  estado: PermitStatus;
  area: "TIERRA" | "FLOTA";
  descripcion: string;
  fechaSolicitud: string;
  fechaVencimiento: string;
  permitType: { nombre: string; prefijo: string } | null;
  company: { nombre: string } | null;
  plant: { sigla: string } | null;
  location: { nombre: string } | null;
}

export interface CatalogResponse {
  permitTypes: {
    id: string;
    nombre: string;
    prefijo: string;
    requierePermisoPadre: boolean;
    requiereACR: boolean;
    cierreManual: boolean;
  }[];
  plants: {
    id: string;
    nombre: string;
    sigla: string;
    zones: { id: string; nombre: string; locations: { id: string; nombre: string }[] }[];
  }[];
  companies: { id: string; nombre: string; tipo: "INTERNA" | "EXTERNA" }[];
}
