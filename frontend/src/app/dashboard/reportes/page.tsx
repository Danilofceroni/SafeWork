"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  FileCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Shield,
  Flame,
  MountainSnow,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from "recharts";

// Datos simulados para gráficos
const permisosPorMes = [
  { mes: "Ene", generales: 32, criticos: 8 },
  { mes: "Feb", generales: 28, criticos: 12 },
  { mes: "Mar", generales: 45, criticos: 10 },
  { mes: "Abr", generales: 38, criticos: 15 },
  { mes: "May", generales: 12, criticos: 4 },
];

const distribucionEstado = [
  { name: "Activos", value: 12, color: "#10b981" },
  { name: "Pendientes", value: 3, color: "#f59e0b" },
  { name: "Cerrados", value: 127, color: "#64748b" },
  { name: "Vencidos", value: 2, color: "#ef4444" },
];

const tendenciaSemanal = [
  { dia: "Lun", solicitudes: 8, aprobados: 7 },
  { dia: "Mar", solicitudes: 12, aprobados: 10 },
  { dia: "Mié", solicitudes: 6, aprobados: 6 },
  { dia: "Jue", solicitudes: 9, aprobados: 8 },
  { dia: "Vie", solicitudes: 11, aprobados: 9 },
];

const criticosPorTipo = [
  { tipo: "Trabajo en Caliente", cantidad: 18, icon: Flame },
  { tipo: "Trabajo en Altura", cantidad: 14, icon: MountainSnow },
  { tipo: "Espacio Confinado", cantidad: 9, icon: Shield },
];

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

const variantesContenedor = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const variantesItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ReportesPage() {
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
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
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

      {/* Fila de Gráficos 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Gráfico de Barras */}
        <motion.div variants={variantesItem} className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Permisos por Mes</h3>
              <p className="text-xs text-slate-500">Generales vs Críticos — 2026</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-500" />
                <span className="text-slate-600">Generales</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-500" />
                <span className="text-slate-600">Críticos</span>
              </span>
            </div>
          </div>
          <div className="p-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={permisosPorMes} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontSize: "13px" }}
                />
                <Bar dataKey="generales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="criticos" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráfico Circular (Torta) */}
        <motion.div variants={variantesItem} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Distribución por Estado</h3>
            <p className="text-xs text-slate-500">Total: 144 permisos</p>
          </div>
          <div className="p-6 h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={distribucionEstado}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {distribucionEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {distribucionEstado.map((item) => (
                <span key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name} ({item.value})
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fila de Gráficos 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Gráfico de Área */}
        <motion.div variants={variantesItem} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Tendencia Semanal</h3>
            <p className="text-xs text-slate-500">Solicitudes vs Aprobados — Semana actual</p>
          </div>
          <div className="p-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tendenciaSemanal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }} />
                <Area type="monotone" dataKey="solicitudes" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="aprobados" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Críticos por Tipo */}
        <motion.div variants={variantesItem} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-slate-900 text-sm">Permisos Críticos por Tipo</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Acumulado 2026</p>
          </div>
          <div className="p-6 space-y-5">
            {criticosPorTipo.map((item) => {
              const maxVal = Math.max(...criticosPorTipo.map(c => c.cantidad));
              const pct = (item.cantidad / maxVal) * 100;
              return (
                <div key={item.tipo}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-semibold text-slate-900">{item.tipo}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{item.cantidad}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabla de Resumen */}
          <div className="px-6 pb-6 pt-2">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Resumen</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-slate-900">41</p>
                  <p className="text-[11px] text-slate-500">Total Críticos</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-emerald-600">39</p>
                  <p className="text-[11px] text-slate-500">Cerrados OK</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-500">0</p>
                  <p className="text-[11px] text-slate-500">Incidentes</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
