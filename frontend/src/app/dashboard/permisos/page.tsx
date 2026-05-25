"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  ChevronRight,
  Calendar,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  FileCheck,
  Flame,
  MountainSnow,
  Shield,
  Wrench,
  Eye,
  CheckCircle2,
  Timer,
  Download,
} from "lucide-react";

type Permiso = {
  id: string;
  titulo: string;
  tipo: "general" | "critico";
  categoria?: string;
  ubicacion: string;
  solicitante: string;
  supervisor: string;
  fechaSolicitud: string;
  vigencia: string;
  estado: "activo" | "pendiente" | "cerrado" | "vencido";
  icon: typeof Wrench;
};

const todosPermisos: Permiso[] = [
  {
    id: "PG-2026-0412",
    titulo: "Mantenimiento de Cinta Transportadora",
    tipo: "general",
    ubicacion: "Planta de Congelados, Sector B",
    solicitante: "Juan Pérez M.",
    supervisor: "Carlos Araya",
    fechaSolicitud: "02/05/2026",
    vigencia: "4h restantes",
    estado: "activo",
    icon: Wrench,
  },
  {
    id: "PG-2026-0411",
    titulo: "Inspección Visual de Estanques",
    tipo: "general",
    ubicacion: "Planta de Harina, Patio Norte",
    solicitante: "Roberto Cáceres L.",
    supervisor: "Carlos Araya",
    fechaSolicitud: "02/05/2026",
    vigencia: "6h restantes",
    estado: "activo",
    icon: Eye,
  },
  {
    id: "PG-2026-0410",
    titulo: "Limpieza Industrial de Ductos",
    tipo: "general",
    ubicacion: "Planta de Conservas, Nivel 1",
    solicitante: "Miguel Torres R.",
    supervisor: "Felipe Soto",
    fechaSolicitud: "02/05/2026",
    vigencia: "2h restantes",
    estado: "activo",
    icon: Wrench,
  },
  {
    id: "PG-2026-0409",
    titulo: "Reparación de Válvula Hidráulica",
    tipo: "general",
    ubicacion: "Sala de Máquinas, Zona 3",
    solicitante: "Héctor Rivas N.",
    supervisor: "Carlos Araya",
    fechaSolicitud: "01/05/2026",
    vigencia: "Cerrado",
    estado: "cerrado",
    icon: Wrench,
  },
  {
    id: "PC-2026-0089",
    titulo: "Trabajo en Altura — Reparación de Techo",
    tipo: "critico",
    categoria: "Trabajo en Altura",
    ubicacion: "Planta de Conservas, Galpón Principal",
    solicitante: "Andrés Muñoz V.",
    supervisor: "Carlos Araya",
    fechaSolicitud: "02/05/2026",
    vigencia: "Pendiente de firma",
    estado: "pendiente",
    icon: MountainSnow,
  },
  {
    id: "PC-2026-0088",
    titulo: "Trabajo en Caliente — Soldadura de Tuberías",
    tipo: "critico",
    categoria: "Trabajo en Caliente",
    ubicacion: "Área de Calderas, Subsector C",
    solicitante: "Felipe Contreras S.",
    supervisor: "Felipe Soto",
    fechaSolicitud: "02/05/2026",
    vigencia: "1h 20min restantes",
    estado: "activo",
    icon: Flame,
  },
  {
    id: "PC-2026-0087",
    titulo: "Ingreso a Espacio Confinado — Estanque T-04",
    tipo: "critico",
    categoria: "Espacio Confinado",
    ubicacion: "Planta de Harina, Zona Restringida",
    solicitante: "Diego Ramírez P.",
    supervisor: "Carlos Araya",
    fechaSolicitud: "01/05/2026",
    vigencia: "Cerrado",
    estado: "cerrado",
    icon: Shield,
  },
  {
    id: "PC-2026-0086",
    titulo: "Trabajo en Caliente — Corte con Soplete",
    tipo: "critico",
    categoria: "Trabajo en Caliente",
    ubicacion: "Taller Mecánico, Sector A",
    solicitante: "Luis Arriagada C.",
    supervisor: "Felipe Soto",
    fechaSolicitud: "30/04/2026",
    vigencia: "Vencido",
    estado: "vencido",
    icon: Flame,
  },
];

function StatusBadge({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    activo: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pendiente: "bg-amber-50 text-amber-700 border-amber-200",
    cerrado: "bg-slate-100 text-slate-600 border-slate-200",
    vencido: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<string, string> = {
    activo: "Activo",
    pendiente: "Pendiente",
    cerrado: "Cerrado",
    vencido: "Vencido",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[estado] || styles.cerrado}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        estado === "activo" ? "bg-emerald-500" :
        estado === "pendiente" ? "bg-amber-500" :
        estado === "cerrado" ? "bg-slate-400" : "bg-red-500"
      }`} />
      {labels[estado] || estado}
    </span>
  );
}

function TipoBadge({ tipo }: { tipo: string }) {
  return tipo === "critico" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
      <AlertTriangle className="w-3 h-3" /> Crítico
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
      <FileCheck className="w-3 h-3" /> General
    </span>
  );
}

export default function PermisosPage() {
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "general" | "critico">("todos");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activo" | "pendiente" | "cerrado" | "vencido">("todos");
  const [busqueda, setBusqueda] = useState("");

  const permisosFiltrados = todosPermisos.filter((p) => {
    if (filtroTipo !== "todos" && p.tipo !== filtroTipo) return false;
    if (filtroEstado !== "todos" && p.estado !== filtroEstado) return false;
    if (busqueda && !p.titulo.toLowerCase().includes(busqueda.toLowerCase()) && !p.id.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Permisos de Trabajo</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Gestiona y supervisa todos los permisos activos y pasados
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-brand-orange/15 hover:shadow-brand-orange/25 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm">
          <Plus className="w-4 h-4" />
          Nuevo Permiso
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder:text-slate-400"
            />
          </div>

          {/* Filtro por Tipo */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex gap-1 bg-slate-50 rounded-xl p-1 border border-slate-200">
              {[
                { key: "todos", label: "Todos" },
                { key: "general", label: "Generales" },
                { key: "critico", label: "Críticos" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setFiltroTipo(opt.key as typeof filtroTipo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filtroTipo === opt.key
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por Estado */}
          <div className="flex gap-1 bg-slate-50 rounded-xl p-1 border border-slate-200">
            {[
              { key: "todos", label: "Todos" },
              { key: "activo", label: "Activos" },
              { key: "pendiente", label: "Pendientes" },
              { key: "cerrado", label: "Cerrados" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFiltroEstado(opt.key as typeof filtroEstado)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filtroEstado === opt.key
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cantidad de Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Mostrando <span className="font-semibold text-slate-900">{permisosFiltrados.length}</span> de {todosPermisos.length} permisos
        </p>
        <button className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-navy font-medium transition-colors">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Tabla de Permisos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Encabezado de Tabla */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-4">Permiso</div>
          <div className="col-span-2">Ubicación</div>
          <div className="col-span-2">Solicitante</div>
          <div className="col-span-1">Tipo</div>
          <div className="col-span-1">Estado</div>
          <div className="col-span-1">Vigencia</div>
          <div className="col-span-1"></div>
        </div>

        {/* Cuerpo de Tabla */}
        <div className="divide-y divide-slate-100">
          {permisosFiltrados.map((permiso) => (
            <Link
              key={permiso.id}
              href={`/dashboard/permisos/${permiso.id}`}
              className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors group cursor-pointer items-center"
            >
              {/* Información del Permiso */}
              <div className="col-span-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                  permiso.tipo === "critico"
                    ? "bg-red-50 border-red-200"
                    : "bg-slate-50 border-slate-200"
                }`}>
                  <permiso.icon className={`w-5 h-5 ${
                    permiso.tipo === "critico" ? "text-red-600" : "text-slate-500"
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-navy transition-colors truncate">
                    {permiso.titulo}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">{permiso.id}</p>
                </div>
              </div>

              {/* Ubicación */}
              <div className="col-span-2 hidden lg:flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-sm text-slate-600 truncate">{permiso.ubicacion}</span>
              </div>

              {/* Solicitante */}
              <div className="col-span-2 hidden lg:flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-sm text-slate-600">{permiso.solicitante}</span>
              </div>

              {/* Tipo */}
              <div className="col-span-1 hidden lg:block">
                <TipoBadge tipo={permiso.tipo} />
              </div>

              {/* Estado */}
              <div className="col-span-1">
                <StatusBadge estado={permiso.estado} />
              </div>

              {/* Vigencia */}
              <div className="col-span-1 hidden lg:flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className={`text-xs font-medium ${
                  permiso.estado === "activo" ? "text-emerald-600" :
                  permiso.estado === "pendiente" ? "text-amber-600" :
                  permiso.estado === "vencido" ? "text-red-500" : "text-slate-500"
                }`}>
                  {permiso.vigencia}
                </span>
              </div>

              {/* Flecha Indicadora */}
              <div className="col-span-1 hidden lg:flex justify-end">
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-navy transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {permisosFiltrados.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Sin resultados</p>
            <p className="text-xs text-slate-500 mt-1">No se encontraron permisos con los filtros seleccionados</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
