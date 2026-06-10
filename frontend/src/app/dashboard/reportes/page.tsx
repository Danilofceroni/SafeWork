"use client";

import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Calendar,
  Download,
  FileCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const ReportesCharts = dynamic(() => import("./ReportesCharts"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm h-80 animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-80 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-64 animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-64 animate-pulse" />
      </div>
    </div>
  ),
});

const indicadoresClave = [
  {
    etiqueta: "Total Permisos (Mayo)",
    valor: "16",
    cambio: "+12%",
    tendencia: "up",
    icono: FileCheck,
    color: "text-blue-600",
    fondo: "bg-blue-50",
    borde: "border-blue-100",
  },
  {
    etiqueta: "Tiempo Promedio Aprobación",
    valor: "2.4h",
    cambio: "-15%",
    tendencia: "down",
    icono: Clock,
    color: "text-emerald-600",
    fondo: "bg-emerald-50",
    borde: "border-emerald-100",
  },
  {
    etiqueta: "Tasa de Aprobación",
    valor: "94%",
    cambio: "+2%",
    tendencia: "up",
    icono: CheckCircle2,
    color: "text-amber-600",
    fondo: "bg-amber-50",
    borde: "border-amber-100",
  },
  {
    etiqueta: "Trabajadores Activos",
    valor: "42",
    cambio: "+3",
    tendencia: "up",
    icono: Users,
    color: "text-violet-600",
    fondo: "bg-violet-50",
    borde: "border-violet-100",
  },
];

export default function ReportesPage() {
  const shouldReduceMotion = useReducedMotion();

  const variantesContenedor = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06 } },
  };
  const variantesItem = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    show: { opacity: 1, y: 0, transition: { duration: shouldReduceMotion ? 0 : 0.4 } },
  };

  return (
    <motion.div
      variants={variantesContenedor}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Encabezado */}
      <motion.div variants={variantesItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reportes y Estadísticas</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Análisis operacional — Mayo 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700 font-medium">Mayo 2026</span>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </motion.div>

      {/* Indicadores Clave (KPIs) */}
      <motion.div variants={variantesItem} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {indicadoresClave.map((kpi) => (
          <div key={kpi.etiqueta} className={`bg-white p-5 rounded-2xl border ${kpi.borde} shadow-sm`}>
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 ${kpi.fondo} rounded-xl flex items-center justify-center`}>
                <kpi.icono className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                kpi.tendencia === "up" ? "text-emerald-600" : "text-red-500"
              }`}>
                {kpi.tendencia === "up"
                  ? <ArrowUpRight className="w-3.5 h-3.5" />
                  : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpi.cambio}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">{kpi.valor}</p>
              <p className="text-sm text-slate-600 mt-1">{kpi.etiqueta}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Gráficos — cargados de forma diferida */}
      <ReportesCharts />
    </motion.div>
  );
}
