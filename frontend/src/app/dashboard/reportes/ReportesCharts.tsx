"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Shield, Flame, MountainSnow } from "lucide-react";
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
  Area,
  AreaChart,
} from "recharts";

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

const tooltipStyle = { borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" };

export default function ReportesCharts() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {/* Fila de Gráficos 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                <Tooltip contentStyle={{ ...tooltipStyle, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="generales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="criticos" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Distribución por Estado</h3>
            <p className="text-xs text-slate-500">Total: 144 permisos</p>
          </div>
          <div className="p-6 h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie data={distribucionEstado} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                  {distribucionEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
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
        </div>
      </div>

      {/* Fila de Gráficos 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="solicitudes" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="aprobados" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                  <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      style={{ transformOrigin: "left" }}
                      initial={{ scaleX: shouldReduceMotion ? pct / 100 : 0 }}
                      animate={{ scaleX: pct / 100 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" }}
                      className="absolute inset-0 h-full bg-red-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 pb-6 pt-2">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 mb-3">Resumen</p>
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
        </div>
      </div>
    </>
  );
}
