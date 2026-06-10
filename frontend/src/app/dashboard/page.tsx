"use client";

import { motion, useReducedMotion } from "framer-motion";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  FileCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Flame,
  MountainSnow,
  Zap,
  Wrench,
  Eye,
  ChevronRight,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Timer,
} from "lucide-react";

// Datos ficticios (Mock)
const estadisticas = [
  {
    label: "Permisos Activos",
    value: 12,
    change: "+3",
    tendencia: "ascendente",
    icon: FileCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    borderColor: "border-emerald-100",
  },
  {
    label: "Pendientes de Firma",
    value: 3,
    change: "-1",
    tendencia: "descendente",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    borderColor: "border-amber-100",
  },
  {
    label: "Vencen Hoy",
    value: 2,
    change: "0",
    tendencia: "neutral",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    borderColor: "border-red-100",
  },
  {
    label: "Cerrados Esta Semana",
    value: 27,
    change: "+8",
    tendencia: "ascendente",
    icon: TrendingUp,
    color: "text-brand-navy",
    bg: "bg-blue-50",
    borderColor: "border-blue-100",
  },
];

type EstadoPermiso = "activo" | "pendiente" | "cerrado" | "vencido";

const permisosGenerales: { id: string; titulo: string; ubicacion: string; solicitante: string; vigencia: string; estado: EstadoPermiso; icon: typeof Wrench }[] = [
  {
    id: "PG-2026-0412",
    titulo: "Mantenimiento de Cinta Transportadora",
    ubicacion: "Planta de Congelados, Sector B",
    solicitante: "Juan Pérez M.",
    vigencia: "4h restantes",
    estado: "activo",
    icon: Wrench,
  },
  {
    id: "PG-2026-0411",
    titulo: "Inspección Visual de Estanques",
    ubicacion: "Planta de Harina, Patio Norte",
    solicitante: "Roberto Cáceres L.",
    vigencia: "6h restantes",
    estado: "activo",
    icon: Eye,
  },
  {
    id: "PG-2026-0410",
    titulo: "Limpieza Industrial de Ductos",
    ubicacion: "Planta de Conservas, Nivel 1",
    solicitante: "Miguel Torres R.",
    vigencia: "2h restantes",
    estado: "activo",
    icon: Wrench,
  },
];

const permisosCriticos: { id: string; titulo: string; ubicacion: string; solicitante: string; estado: EstadoPermiso; detalle: string; icon: typeof Wrench; severity: string }[] = [
  {
    id: "PC-2026-0089",
    titulo: "Trabajo en Altura — Reparación de Techo",
    ubicacion: "Planta de Conservas, Galpón Principal",
    solicitante: "Andrés Muñoz V.",
    estado: "pendiente",
    detalle: "Falta firma de Prevencionista de Riesgos",
    icon: MountainSnow,
    severity: "alta",
  },
  {
    id: "PC-2026-0088",
    titulo: "Trabajo en Caliente — Soldadura de Tuberías",
    ubicacion: "Área de Calderas, Subsector C",
    solicitante: "Felipe Contreras S.",
    estado: "activo",
    detalle: "Vence en 1h 20min",
    icon: Flame,
    severity: "critica",
  },
  {
    id: "PC-2026-0087",
    titulo: "Ingreso a Espacio Confinado — Estanque T-04",
    ubicacion: "Planta de Harina, Zona Restringida",
    solicitante: "Diego Ramírez P.",
    estado: "cerrado",
    detalle: "Finalizado a las 14:30hrs",
    icon: Shield,
    severity: "normal",
  },
];

const actividadReciente = [
  { accion: "Permiso PC-2026-0088 aprobado por Jefe de Área", tiempo: "Hace 15 min", tipo: "aprobado" },
  { accion: "Nueva solicitud de Trabajo en Altura enviada", tiempo: "Hace 45 min", tipo: "nuevo" },
  { accion: "Permiso PG-2026-0409 cerrado exitosamente", tiempo: "Hace 1h", tipo: "cerrado" },
  { accion: "Firma pendiente: Prevencionista requerido en PC-2026-0089", tiempo: "Hace 2h", tipo: "pendiente" },
];


export default function DashboardPage() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    show: { opacity: 1, y: 0, transition: { duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" as const } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Encabezado */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Viernes, 02 de Mayo 2026 — Planta Coronel
          </p>
        </div>
        <PrimaryButton>
          <Plus className="w-4 h-4" />
          Solicitar Nuevo Permiso
        </PrimaryButton>
      </motion.div>

      {/* Cuadrícula de Estadísticas */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {estadisticas.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white p-5 rounded-2xl border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.tendencia !== "neutral" && (
                <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  stat.tendencia === "ascendente" ? "text-emerald-600" : "text-red-500"
                }`}>
                  {stat.tendencia === "ascendente" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {stat.change}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Cuadrícula de Permisos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Permisos Generales */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Permisos Generales</h3>
                <p className="text-xs text-slate-600">Trabajos de bajo riesgo</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
              8 activos
            </span>
          </div>
          <div className="divide-y divide-brand-border/60">
            {permisosGenerales.map((permiso) => (
              <div key={permiso.id} role="button" tabIndex={0} className="px-6 py-4 hover:bg-slate-50/70 transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-inset">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-100 group-hover:border-blue-200 transition-colors">
                    <permiso.icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-navy transition-colors">{permiso.titulo}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{permiso.ubicacion}</p>
                      </div>
                      <StatusBadge estado={permiso.estado} />
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {permiso.vigencia}
                      </span>
                      <span className="text-xs text-slate-500">
                        {permiso.solicitante}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{permiso.id}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-navy flex-shrink-0 mt-1 transition-colors" />
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-brand-border bg-slate-50/50">
            <button className="text-sm font-medium text-brand-navy hover:text-brand-orange transition-colors flex items-center gap-1">
              Ver todos los permisos generales
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Permisos Críticos */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-gradient-to-r from-red-50/50 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center border border-red-100">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Permisos Críticos</h3>
                <p className="text-xs text-red-600 font-medium">Trabajos de alto riesgo — Requieren supervisión</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
              4 registrados
            </span>
          </div>
          <div className="divide-y divide-red-50">
            {permisosCriticos.map((permiso) => (
              <div key={permiso.id} className="px-6 py-4 hover:bg-red-50/30 transition-colors group cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors ${
                    permiso.severity === "critica" 
                      ? "bg-red-50 border-red-200 group-hover:border-red-300" 
                      : permiso.severity === "alta"
                      ? "bg-amber-50 border-amber-200 group-hover:border-amber-300"
                      : "bg-slate-50 border-slate-100"
                  }`}>
                    <permiso.icon className={`w-4 h-4 ${
                      permiso.severity === "critica" ? "text-red-600" : 
                      permiso.severity === "alta" ? "text-amber-600" : "text-slate-500"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-navy transition-colors">{permiso.titulo}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{permiso.ubicacion}</p>
                      </div>
                      <StatusBadge estado={permiso.estado} />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs font-medium flex items-center gap-1 ${
                        permiso.estado === "pendiente" ? "text-amber-600" : 
                        permiso.estado === "activo" && permiso.severity === "critica" ? "text-red-500" : "text-slate-500"
                      }`}>
                        {permiso.estado === "pendiente" ? <Timer className="w-3 h-3" /> :
                         permiso.estado === "activo" ? <Clock className="w-3 h-3" /> :
                         <CheckCircle2 className="w-3 h-3" />}
                        {permiso.detalle}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">{permiso.id} — {permiso.solicitante}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-navy flex-shrink-0 mt-1 transition-colors" />
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-red-100 bg-red-50/30">
            <button className="text-sm font-medium text-brand-navy hover:text-brand-orange transition-colors flex items-center gap-1">
              Ver todos los permisos críticos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Canal de Actividad Reciente */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-navy/5 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-brand-navy" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Actividad Reciente</h3>
          </div>
          <button className="text-xs font-medium text-brand-navy hover:text-brand-orange transition-colors">
            Ver todo
          </button>
        </div>
        <div className="divide-y divide-brand-border/60">
          {actividadReciente.map((item, index) => (
            <div key={index} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                item.tipo === "aprobado" ? "bg-emerald-50" :
                item.tipo === "nuevo" ? "bg-blue-50" :
                item.tipo === "cerrado" ? "bg-slate-100" :
                "bg-amber-50"
              }`}>
                {item.tipo === "aprobado" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                 item.tipo === "nuevo" ? <Plus className="w-4 h-4 text-blue-600" /> :
                 item.tipo === "cerrado" ? <XCircle className="w-4 h-4 text-slate-500" /> :
                 <AlertTriangle className="w-4 h-4 text-amber-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{item.accion}</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">{item.tiempo}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
