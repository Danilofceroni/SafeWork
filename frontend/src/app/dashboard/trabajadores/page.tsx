"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  BadgeCheck,
  HardHat,
  ChevronRight,
  Filter,
  Shield,
  FileCheck,
} from "lucide-react";

type Trabajador = {
  id: string;
  nombre: string;
  rut: string;
  cargo: string;
  area: string;
  telefono: string;
  email: string;
  estado: "activo" | "inactivo" | "licencia";
  permisosActivos: number;
  certificaciones: string[];
};

const trabajadores: Trabajador[] = [
  {
    id: "T001",
    nombre: "Juan Pérez Mardones",
    rut: "14.234.567-8",
    cargo: "Solicitante (ITO)",
    area: "Inspección Técnica",
    telefono: "+56 9 1234 5678",
    email: "jperez@camanchaca.cl",
    estado: "activo",
    permisosActivos: 1,
    certificaciones: ["Bloqueo/Etiquetado", "Trabajo en Altura"],
  },
  {
    id: "T002",
    nombre: "Andrés Muñoz Valenzuela",
    rut: "12.456.789-0",
    cargo: "Contratista",
    area: "Empresa Externa - Mantenimiento",
    telefono: "+56 9 8765 4321",
    email: "amunoz@contratista.cl",
    estado: "activo",
    permisosActivos: 1,
    certificaciones: ["Trabajo en Altura", "Espacios Confinados"],
  },
  {
    id: "T003",
    nombre: "Felipe Contreras Silva",
    rut: "15.678.234-5",
    cargo: "Jefe de Área",
    area: "Producción - Planta Coronel",
    telefono: "+56 9 5678 1234",
    email: "fcontreras@camanchaca.cl",
    estado: "activo",
    permisosActivos: 1,
    certificaciones: ["Trabajo en Caliente", "Gestión de Operaciones"],
  },
  {
    id: "T004",
    nombre: "María González Rojas",
    rut: "13.567.890-1",
    cargo: "Prevención (SSO)",
    area: "Salud y Seguridad Ocupacional",
    telefono: "+56 9 3456 7890",
    email: "mgonzalez@camanchaca.cl",
    estado: "activo",
    permisosActivos: 1,
    certificaciones: ["Prevención de Riesgos", "Normativa Industrial"],
  },
  {
    id: "T005",
    nombre: "Carlos Araya",
    rut: "11.234.567-9",
    cargo: "Administrador",
    area: "Administración Sistema",
    telefono: "+56 9 6789 0123",
    email: "caraya@camanchaca.cl",
    estado: "activo",
    permisosActivos: 0,
    certificaciones: ["Gestión SafeWork", "Administración TI"],
  },
];


export default function TrabajadoresPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroArea, setFiltroArea] = useState("todos");
  const shouldReduceMotion = useReducedMotion();

  const areas = ["todos", ...Array.from(new Set(trabajadores.map(t => t.area)))];

  const filtrados = trabajadores.filter((t) => {
    if (filtroArea !== "todos" && t.area !== filtroArea) return false;
    if (busqueda && !t.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !t.rut.includes(busqueda)) return false;
    return true;
  });

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
      className="space-y-6"
    >
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trabajadores</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Directorio del personal autorizado para permisos de trabajo
          </p>
        </div>
        <PrimaryButton>
          <Plus className="w-4 h-4" />
          Agregar Trabajador
        </PrimaryButton>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <label htmlFor="search-trabajadores" className="sr-only">Buscar trabajadores</label>
            <input
              id="search-trabajadores"
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o RUT..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex gap-1 bg-slate-50 rounded-xl p-1 border border-slate-200 flex-wrap">
              {areas.map((area) => (
                <button
                  key={area}
                  onClick={() => setFiltroArea(area)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    filtroArea === area
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {area === "todos" ? "Todas las áreas" : area}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contador */}
      <p className="text-sm text-slate-500">
        <span className="font-semibold text-slate-900">{filtrados.length}</span> trabajadores registrados
      </p>

      {/* Cuadrícula */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtrados.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {t.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-brand-navy transition-colors truncate">{t.nombre}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.cargo}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge estado={t.estado} />
                    {t.permisosActivos > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                        <FileCheck className="w-3 h-3" /> {t.permisosActivos} permiso{t.permisosActivos > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <BadgeCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="font-mono">{t.rut}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <HardHat className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{t.area}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{t.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{t.email}</span>
                </div>
              </div>

              {/* Certificaciones */}
              {t.certificaciones.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-600 mb-2">Certificaciones</p>
                  <div className="flex flex-wrap gap-1.5">
                    {t.certificaciones.map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                        <Shield className="w-3 h-3 text-slate-400" /> {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
