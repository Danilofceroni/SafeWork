"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search, Plus, User, Building2, Clock, MapPin, Shield,
  CheckCircle2, XCircle, X, AlertCircle, Loader2, LogIn, LogOut,
  DoorOpen, FileText, ArrowUpRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Visit {
  id: string;
  codigo: string;
  visitanteNombre: string;
  visitanteRut: string;
  visitanteEmpresa: string | null;
  personaVisitada: string;
  motivo: string;
  area: string;
  locationId: string;
  fechaVisita: string;
  estado: string;
  solicitanteId: string | null;
  porteroId: string | null;
  fechaIngreso: string | null;
  fechaSalida: string | null;
  createdAt: string;
  location: { nombre: string; zone: { nombre: string; plant: { nombre: string; sigla: string } } } | null;
  solicitante: { nombre: string } | null;
  portero: { nombre: string } | null;
}

interface Plant {
  id: string;
  nombre: string;
  sigla: string;
  zones: { id: string; nombre: string; locations: { id: string; nombre: string }[] }[];
}

const estadoLabels: Record<string, string> = {
  PENDIENTE_PORTERIA: "Pendiente Portería",
  AUTORIZADA: "Autorizada",
  EN_PLANTA: "En Planta",
  FINALIZADA: "Finalizada",
  RECHAZADA: "Rechazada",
};

const estadoColors: Record<string, string> = {
  PENDIENTE_PORTERIA: "bg-amber-50 text-amber-700 border-amber-200",
  AUTORIZADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  EN_PLANTA: "bg-blue-50 text-blue-700 border-blue-200",
  FINALIZADA: "bg-slate-100 text-slate-600 border-slate-200",
  RECHAZADA: "bg-red-50 text-red-700 border-red-200",
};

interface VisitForm {
  visitanteNombre: string;
  visitanteRut: string;
  visitanteEmpresa: string;
  personaVisitada: string;
  motivo: string;
  area: string;
  locationId: string;
  fechaVisita: string;
}

const emptyForm: VisitForm = {
  visitanteNombre: "",
  visitanteRut: "",
  visitanteEmpresa: "",
  personaVisitada: "",
  motivo: "",
  area: "TIERRA",
  locationId: "",
  fechaVisita: new Date().toISOString().split("T")[0],
};

export default function VisitasPage() {
  const { user } = useAuth();
  const [visitas, setVisitas] = useState<Visit[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState<VisitForm>(emptyForm);
  const [guardando, setGuardando] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [accionandoId, setAccionandoId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isPorteria = user?.roles.includes("PORTERIA") || user?.roles.includes("ADMIN");

  useEffect(() => {
    apiFetch<{ plants: Plant[] }>("/catalog").then((data) => {
      setPlants(data.plants);
    }).catch(() => {});
  }, []);

  const cargarVisitas = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = filtroEstado !== "todos" ? `?estado=${filtroEstado}` : "";
      const data = await apiFetch<Visit[]>(`/visits${params}`);
      setVisitas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar visitas");
    } finally {
      setCargando(false);
    }
  }, [filtroEstado]);

  useEffect(() => { cargarVisitas(); }, [cargarVisitas]);

  const zonas = plants.find((p) => p.id === selectedPlantId)?.zones ?? [];
  const ubicaciones = zonas.find((z) => z.id === selectedZoneId)?.locations ?? [];

  useEffect(() => {
    if (ubicaciones.length && !form.locationId) {
      setForm((prev) => ({ ...prev, locationId: ubicaciones[0].id }));
    }
  }, [ubicaciones, form.locationId]);

  const filtrados = visitas.filter((v) => {
    const q = busqueda.toLowerCase();
    return !q || v.visitanteNombre.toLowerCase().includes(q) || v.visitanteRut.includes(q) || v.codigo.toLowerCase().includes(q);
  });

  async function crearVisita(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await apiFetch("/visits", { method: "POST", body: JSON.stringify(form) });
      setModalAbierto(false);
      setForm(emptyForm);
      setSelectedPlantId("");
      setSelectedZoneId("");
      await cargarVisitas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear visita");
    } finally {
      setGuardando(false);
    }
  }

  async function ejecutarAccion(id: string, accion: string) {
    setAccionandoId(id);
    setError(null);
    try {
      await apiFetch(`/visits/${id}/${accion}`, { method: "POST" });
      await cargarVisitas();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${accion} visita`);
    } finally {
      setAccionandoId(null);
    }
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitas</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Registra y autoriza el ingreso de visitas externas
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-brand-navy font-semibold py-2.5 px-5 text-sm rounded-xl shadow-md shadow-brand-orange/15 hover:shadow-brand-orange/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Nueva Visita
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, RUT o código..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["todos", ...Object.keys(estadoLabels)].map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                filtroEstado === e
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {e === "todos" ? "Todos" : estadoLabels[e]}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No se encontraron visitas</p>
          <p className="text-slate-400 text-sm mt-1">Crea una nueva visita para comenzar</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Código</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Visitante</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Empresa</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Visita a</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Ubicación</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Estado</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-semibold text-brand-navy">{v.codigo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange text-xs font-bold flex-shrink-0">
                          {v.visitanteNombre.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{v.visitanteNombre}</p>
                          <p className="text-xs text-slate-500 font-mono">{v.visitanteRut}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{v.visitanteEmpresa ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{v.personaVisitada}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="text-xs text-slate-400">{v.location?.zone?.plant?.sigla}</span>
                      {" / "}{v.location?.nombre}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${estadoColors[v.estado] ?? ""}`}>
                        {v.estado === "PENDIENTE_PORTERIA" && <Clock className="w-3 h-3" />}
                        {v.estado === "AUTORIZADA" && <CheckCircle2 className="w-3 h-3" />}
                        {v.estado === "EN_PLANTA" && <LogIn className="w-3 h-3" />}
                        {v.estado === "FINALIZADA" && <XCircle className="w-3 h-3" />}
                        {v.estado === "RECHAZADA" && <XCircle className="w-3 h-3" />}
                        {estadoLabels[v.estado] ?? v.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {v.estado === "PENDIENTE_PORTERIA" && isPorteria && (
                          <>
                            <button
                              onClick={() => ejecutarAccion(v.id, "autorizar")}
                              disabled={accionandoId === v.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              {accionandoId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                              Autorizar
                            </button>
                            <button
                              onClick={() => ejecutarAccion(v.id, "rechazar")}
                              disabled={accionandoId === v.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              {accionandoId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                              Rechazar
                            </button>
                          </>
                        )}
                        {v.estado === "AUTORIZADA" && isPorteria && (
                          <button
                            onClick={() => ejecutarAccion(v.id, "ingreso")}
                            disabled={accionandoId === v.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {accionandoId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogIn className="w-3 h-3" />}
                            Registrar Ingreso
                          </button>
                        )}
                        {v.estado === "EN_PLANTA" && (
                          <button
                            onClick={() => ejecutarAccion(v.id, "salida")}
                            disabled={accionandoId === v.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {accionandoId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
                            Registrar Salida
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-100">
            {filtrados.map((v) => (
              <div key={v.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-brand-navy">{v.codigo}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${estadoColors[v.estado] ?? ""}`}>
                    {estadoLabels[v.estado] ?? v.estado}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange text-xs font-bold">
                    {v.visitanteNombre.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{v.visitanteNombre}</p>
                    <p className="text-xs text-slate-500">{v.visitanteRut}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{v.visitanteEmpresa ?? "Sin empresa"}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{v.personaVisitada}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.location?.nombre}</span>
                </div>
                <div className="flex gap-2">
                  {v.estado === "PENDIENTE_PORTERIA" && isPorteria && (
                    <>
                      <button onClick={() => ejecutarAccion(v.id, "autorizar")} disabled={accionandoId === v.id} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                        {accionandoId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Autorizar
                      </button>
                      <button onClick={() => ejecutarAccion(v.id, "rechazar")} disabled={accionandoId === v.id} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                        {accionandoId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} Rechazar
                      </button>
                    </>
                  )}
                  {v.estado === "AUTORIZADA" && isPorteria && (
                    <button onClick={() => ejecutarAccion(v.id, "ingreso")} disabled={accionandoId === v.id} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                      {accionandoId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogIn className="w-3 h-3" />} Registrar Ingreso
                    </button>
                  )}
                  {v.estado === "EN_PLANTA" && (
                    <button onClick={() => ejecutarAccion(v.id, "salida")} disabled={accionandoId === v.id} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                      {accionandoId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />} Registrar Salida
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalAbierto(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Nueva Visita</h2>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={crearVisita} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nombre Visitante</label>
                  <input type="text" value={form.visitanteNombre} onChange={(e) => setForm((prev) => ({ ...prev, visitanteNombre: e.target.value }))} required className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">RUT</label>
                  <input type="text" value={form.visitanteRut} onChange={(e) => setForm((prev) => ({ ...prev, visitanteRut: e.target.value }))} required className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Empresa</label>
                  <input type="text" value={form.visitanteEmpresa} onChange={(e) => setForm((prev) => ({ ...prev, visitanteEmpresa: e.target.value }))} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder:text-slate-400" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Persona a Visitar</label>
                  <input type="text" value={form.personaVisitada} onChange={(e) => setForm((prev) => ({ ...prev, personaVisitada: e.target.value }))} required className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder:text-slate-400" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Motivo</label>
                  <textarea value={form.motivo} onChange={(e) => setForm((prev) => ({ ...prev, motivo: e.target.value }))} required rows={2} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Área</label>
                  <select value={form.area} onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange">
                    <option value="TIERRA">Tierra</option>
                    <option value="FLOTA">Flota</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Fecha Visita</label>
                  <input type="date" value={form.fechaVisita} onChange={(e) => setForm((prev) => ({ ...prev, fechaVisita: e.target.value }))} required className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Planta</label>
                  <select value={selectedPlantId} onChange={(e) => { setSelectedPlantId(e.target.value); setSelectedZoneId(""); setForm((prev) => ({ ...prev, locationId: "" })); }} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange">
                    <option value="">Seleccionar</option>
                    {plants.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.sigla})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Zona</label>
                  <select value={selectedZoneId} onChange={(e) => { setSelectedZoneId(e.target.value); setForm((prev) => ({ ...prev, locationId: "" })); }} disabled={!selectedPlantId} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange disabled:opacity-50">
                    <option value="">Seleccionar</option>
                    {zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ubicación</label>
                  <select value={form.locationId} onChange={(e) => setForm((prev) => ({ ...prev, locationId: e.target.value }))} disabled={!selectedZoneId} required className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange disabled:opacity-50">
                    <option value="">Seleccionar</option>
                    {ubicaciones.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-dark text-brand-navy font-semibold text-sm rounded-xl shadow-md shadow-brand-orange/15 hover:shadow-brand-orange/25 transition-all disabled:opacity-50">
                  {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Crear Visita
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
