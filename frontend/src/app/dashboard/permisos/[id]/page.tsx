"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  User,
  Clock,
  Calendar,
  AlertTriangle,
  FileCheck,
  Flame,
  MountainSnow,
  Shield,
  Wrench,
  Eye,
  CheckCircle2,
  XCircle,
  Timer,
  Printer,
  Download,
  Edit3,
  UserCheck,
  ClipboardCheck,
  ShieldCheck,
  PlayCircle,
  StopCircle,
  FileText,
  HardHat,
} from "lucide-react";

// Datos ficticios de permisos indexados por ID
const datosPermisos: Record<string, {
  id: string;
  titulo: string;
  tipo: "general" | "critico";
  categoria?: string;
  ubicacion: string;
  area: string;
  solicitante: string;
  rutSolicitante: string;
  cargoSolicitante: string;
  supervisor: string;
  fechaSolicitud: string;
  fechaInicio: string;
  fechaFin: string;
  vigencia: string;
  estado: "activo" | "pendiente" | "cerrado" | "vencido";
  descripcion: string;
  riesgos: string[];
  epp: string[];
  icon: typeof Wrench;
}> = {
  "PC-2026-0089": {
    id: "PC-2026-0089",
    titulo: "Trabajo en Altura — Reparación de Techo",
    tipo: "critico",
    categoria: "Trabajo en Altura",
    ubicacion: "Planta de Conservas, Galpón Principal",
    area: "Producción",
    solicitante: "Juan Pérez M.",
    rutSolicitante: "14.234.567-8",
    cargoSolicitante: "Solicitante (ITO)",
    supervisor: "Carlos Araya",
    fechaSolicitud: "02/05/2026 08:30",
    fechaInicio: "02/05/2026 10:00",
    fechaFin: "02/05/2026 16:00",
    vigencia: "Pendiente de firma",
    estado: "pendiente",
    descripcion: "Reparación de secciones dañadas del techo del galpón principal de la Planta de Conservas. Se requiere trabajo en altura a 8 metros con uso de andamios certificados. Incluye retiro de planchas deterioradas e instalación de nuevas planchas de zinc alum.",
    riesgos: ["Caída de altura superior a 1.8m", "Caída de objetos", "Exposición a condiciones climáticas", "Cortes con material metálico"],
    epp: ["Arnés de seguridad completo", "Casco con barbiquejo", "Guantes de corte", "Calzado de seguridad", "Lentes de protección", "Bloqueador solar"],
    icon: MountainSnow,
  },
  "PC-2026-0088": {
    id: "PC-2026-0088",
    titulo: "Trabajo en Caliente — Soldadura de Tuberías",
    tipo: "critico",
    categoria: "Trabajo en Caliente",
    ubicacion: "Área de Calderas, Subsector C",
    area: "Mantención",
    solicitante: "Andrés Muñoz V.",
    rutSolicitante: "12.456.789-0",
    cargoSolicitante: "Contratista",
    supervisor: "Carlos Araya",
    fechaSolicitud: "02/05/2026 07:00",
    fechaInicio: "02/05/2026 09:00",
    fechaFin: "02/05/2026 13:00",
    vigencia: "1h 20min restantes",
    estado: "activo",
    descripcion: "Soldadura de tuberías de vapor en el subsector C del área de calderas. Se realizará soldadura al arco eléctrico en tuberías de 4 pulgadas. Área previamente despejada y ventilada.",
    riesgos: ["Incendio por proyección de chispas", "Quemaduras", "Exposición a humos de soldadura", "Electrocución"],
    epp: ["Máscara de soldador", "Guantes de cuero largo", "Mandil de cuero", "Calzado de seguridad", "Protección respiratoria"],
    icon: Flame,
  },
  "PG-2026-0412": {
    id: "PG-2026-0412",
    titulo: "Mantenimiento de Cinta Transportadora",
    tipo: "general",
    ubicacion: "Planta de Congelados, Sector B",
    area: "Producción",
    solicitante: "Juan Pérez M.",
    rutSolicitante: "14.234.567-8",
    cargoSolicitante: "Mecánico Industrial",
    supervisor: "Carlos Araya",
    fechaSolicitud: "02/05/2026 08:00",
    fechaInicio: "02/05/2026 09:00",
    fechaFin: "02/05/2026 13:00",
    vigencia: "4h restantes",
    estado: "activo",
    descripcion: "Mantenimiento preventivo de la cinta transportadora CT-05 del Sector B. Incluye revisión de rodamientos, tensión de correa, lubricación de componentes mecánicos y limpieza general del sistema.",
    riesgos: ["Atrapamiento en partes móviles", "Contacto con superficies calientes"],
    epp: ["Casco de seguridad", "Guantes mecánicos", "Calzado de seguridad", "Lentes de protección"],
    icon: Wrench,
  },
};

// Datos de respaldo para cualquier permiso que no esté en nuestro mapa
const permisoPorDefecto = {
  id: "PG-2026-0000",
  titulo: "Permiso de Trabajo",
  tipo: "general" as const,
  ubicacion: "Planta Coronel",
  area: "General",
  solicitante: "Usuario",
  rutSolicitante: "00.000.000-0",
  cargoSolicitante: "Trabajador",
  supervisor: "Carlos Araya",
  fechaSolicitud: "02/05/2026",
  fechaInicio: "02/05/2026",
  fechaFin: "02/05/2026",
  vigencia: "-",
  estado: "cerrado" as const,
  descripcion: "Sin descripción disponible.",
  riesgos: [],
  epp: [],
  icon: Wrench,
};

type PasoLineaTiempo = {
  label: string;
  responsable: string;
  cargo: string;
  fecha: string | null;
  estado: "completado" | "actual" | "pendiente";
  icon: typeof UserCheck;
};

function obtenerLineaDeTiempo(estado: string): PasoLineaTiempo[] {
  if (estado === "activo") {
    return [
      { label: "Solicitud Creada", responsable: "Juan Pérez M.", cargo: "Solicitante (ITO)", fecha: "02/05/2026 07:00", estado: "completado", icon: FileText },
      { label: "Validación de Prevención", responsable: "María González R.", cargo: "Prevención (SSO)", fecha: "02/05/2026 08:20", estado: "completado", icon: ShieldCheck },
      { label: "Aprobación de Jefe de Área", responsable: "Felipe Contreras S.", cargo: "Jefe de Área", fecha: "02/05/2026 08:50", estado: "completado", icon: ClipboardCheck },
      { label: "Trabajo en Ejecución (Contratista)", responsable: "Andrés Muñoz V.", cargo: "Contratista", fecha: "02/05/2026 09:00", estado: "actual", icon: PlayCircle },
      { label: "Cierre del Permiso", responsable: "-", cargo: "", fecha: null, estado: "pendiente", icon: StopCircle },
    ];
  }
  if (estado === "pendiente") {
    return [
      { label: "Solicitud Creada", responsable: "Juan Pérez M.", cargo: "Solicitante (ITO)", fecha: "02/05/2026 08:30", estado: "completado", icon: FileText },
      { label: "Validación de Prevención", responsable: "María González R.", cargo: "Prevención (SSO)", fecha: null, estado: "actual", icon: ShieldCheck },
      { label: "Aprobación de Jefe de Área", responsable: "Felipe Contreras S.", cargo: "Jefe de Área", fecha: null, estado: "pendiente", icon: ClipboardCheck },
      { label: "Inicio de Trabajo (Contratista)", responsable: "-", cargo: "", fecha: null, estado: "pendiente", icon: PlayCircle },
      { label: "Cierre del Permiso", responsable: "-", cargo: "", fecha: null, estado: "pendiente", icon: StopCircle },
    ];
  }
  // Cerrado
  return [
    { label: "Solicitud Creada", responsable: "Sistema", cargo: "", fecha: "01/05/2026 07:00", estado: "completado", icon: FileText },
    { label: "Aprobación de Supervisor Directo", responsable: "Carlos Araya", cargo: "Supervisor de Operaciones", fecha: "01/05/2026 07:30", estado: "completado", icon: UserCheck },
    { label: "Validación de Prevencionista", responsable: "María González R.", cargo: "Prevencionista de Riesgos", fecha: "01/05/2026 08:00", estado: "completado", icon: ShieldCheck },
    { label: "Aprobación del Jefe de Área", responsable: "Pedro Martínez L.", cargo: "Jefe de Área", fecha: "01/05/2026 08:30", estado: "completado", icon: ClipboardCheck },
    { label: "Trabajo en Ejecución", responsable: "-", cargo: "", fecha: "01/05/2026 09:00", estado: "completado", icon: PlayCircle },
    { label: "Cierre del Permiso", responsable: "Carlos Araya", cargo: "Supervisor de Operaciones", fecha: "01/05/2026 14:30", estado: "completado", icon: StopCircle },
  ];
}

export default function PermisoDetalle() {
  const params = useParams();
  const id = params.id as string;
  const permiso = datosPermisos[id] || { ...permisoPorDefecto, id };
  const lineaDeTiempo = obtenerLineaDeTiempo(permiso.estado);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Botón Volver + Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/permisos" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-navy font-medium mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver a Permisos
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{permiso.titulo}</h1>
            {permiso.tipo === "critico" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5" /> Crítico
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                <FileCheck className="w-3.5 h-3.5" /> General
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 font-mono mt-1">{permiso.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Columna Izquierda — Detalles del Permiso */}
        <div className="xl:col-span-2 space-y-6">
          {/* Banner de Estado */}
          <div className={`rounded-2xl p-5 border flex items-center gap-4 ${
            permiso.estado === "activo" ? "bg-emerald-50/50 border-emerald-200" :
            permiso.estado === "pendiente" ? "bg-amber-50/50 border-amber-200" :
            permiso.estado === "vencido" ? "bg-red-50/50 border-red-200" :
            "bg-slate-50 border-slate-200"
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              permiso.estado === "activo" ? "bg-emerald-100" :
              permiso.estado === "pendiente" ? "bg-amber-100" :
              permiso.estado === "vencido" ? "bg-red-100" :
              "bg-slate-200"
            }`}>
              {permiso.estado === "activo" ? <PlayCircle className="w-6 h-6 text-emerald-600" /> :
               permiso.estado === "pendiente" ? <Timer className="w-6 h-6 text-amber-600" /> :
               permiso.estado === "vencido" ? <XCircle className="w-6 h-6 text-red-600" /> :
               <CheckCircle2 className="w-6 h-6 text-slate-500" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {permiso.estado === "activo" ? "Permiso en Ejecución" :
                 permiso.estado === "pendiente" ? "Pendiente de Aprobación" :
                 permiso.estado === "vencido" ? "Permiso Vencido" : "Permiso Cerrado"}
              </p>
              <p className="text-sm text-slate-600">{permiso.vigencia}</p>
            </div>
          </div>

          {/* Cuadrícula de Información */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Información General</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Solicitante</p>
                <p className="text-sm font-semibold text-slate-900">{permiso.solicitante}</p>
                <p className="text-xs text-slate-500">{permiso.cargoSolicitante} — RUT: {permiso.rutSolicitante}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Supervisor</p>
                <p className="text-sm font-semibold text-slate-900">{permiso.supervisor}</p>
                <p className="text-xs text-slate-500">Supervisor de Operaciones</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Ubicación</p>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-sm text-slate-700">{permiso.ubicacion}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Área</p>
                <p className="text-sm text-slate-700">{permiso.area}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fecha de Inicio</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-sm text-slate-700">{permiso.fechaInicio}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fecha de Término</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-sm text-slate-700">{permiso.fechaFin}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Descripción del Trabajo</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 leading-relaxed">{permiso.descripcion}</p>
            </div>
          </div>

          {/* Riesgos + EPP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h2 className="font-semibold text-slate-900">Riesgos Identificados</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-2.5">
                  {permiso.riesgos.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-blue-500" />
                <h2 className="font-semibold text-slate-900">EPP Requerido</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-2.5">
                  {permiso.epp.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha — Línea de Tiempo / Flujo */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Flujo de Aprobaciones</h2>
              <p className="text-xs text-slate-500 mt-0.5">Seguimiento en tiempo real</p>
            </div>
            <div className="p-6">
              <div className="relative">
                {lineaDeTiempo.map((step, i) => {
                  const isLast = i === lineaDeTiempo.length - 1;
                  return (
                    <div key={i} className="flex gap-4 pb-8 last:pb-0 relative">
                      {/* Línea Vertical Conectora */}
                      {!isLast && (
                        <div className={`absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-16px)] ${
                          step.estado === "completado" ? "bg-emerald-200" : "bg-slate-200"
                        }`} />
                      )}

                      {/* Círculo del Indicador */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                        step.estado === "completado"
                          ? "bg-emerald-50 border-emerald-400"
                          : step.estado === "actual"
                          ? "bg-brand-orange/10 border-brand-orange animate-pulse"
                          : "bg-slate-50 border-slate-200"
                      }`}>
                        <step.icon className={`w-4 h-4 ${
                          step.estado === "completado" ? "text-emerald-600" :
                          step.estado === "actual" ? "text-brand-orange" : "text-slate-400"
                        }`} />
                      </div>

                      {/* Contenido del Paso */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className={`text-sm font-semibold ${
                          step.estado === "completado" ? "text-slate-900" :
                          step.estado === "actual" ? "text-brand-orange" : "text-slate-400"
                        }`}>
                          {step.label}
                        </p>
                        {step.responsable !== "-" && (
                          <p className="text-xs text-slate-600 mt-0.5">{step.responsable}</p>
                        )}
                        {step.cargo && (
                          <p className="text-[11px] text-slate-400">{step.cargo}</p>
                        )}
                        {step.fecha && (
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {step.fecha}
                          </p>
                        )}
                        {step.estado === "actual" && (
                          <span className="inline-block mt-2 px-2.5 py-1 bg-brand-orange/10 text-brand-orange text-[11px] font-bold rounded-lg">
                            En progreso
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          {permiso.estado === "pendiente" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Acciones</h2>
              </div>
              <div className="p-4 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-semibold text-sm transition-colors border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                  Aprobar Permiso
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm transition-colors border border-red-200">
                  <XCircle className="w-5 h-5" />
                  Rechazar Permiso
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm transition-colors border border-slate-200">
                  <Edit3 className="w-5 h-5" />
                  Solicitar Corrección
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
