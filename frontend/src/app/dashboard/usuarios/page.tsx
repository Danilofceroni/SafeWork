"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search, Plus, ChevronRight, Shield, Mail, User, UserCog,
  Pencil, Trash2, X, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Usuario {
  id: string;
  rut: string;
  nombre: string;
  email: string | null;
  activo: boolean;
  createdAt: string;
  roles: { role: { codigo: string } }[];
}

interface UsuarioForm {
  rut: string;
  nombre: string;
  email: string;
  password: string;
  roleCodigo: string;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  SST: "Prevencionista de Riesgos",
  JEFE_AREA: "Jefe de Área",
  SOLICITANTE: "Solicitante",
  CONTRATISTA: "Contratista",
  PORTERIA: "Portería",
  FLOTA: "Flota",
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  SST: "bg-emerald-100 text-emerald-700 border-emerald-200",
  JEFE_AREA: "bg-blue-100 text-blue-700 border-blue-200",
  SOLICITANTE: "bg-amber-100 text-amber-700 border-amber-200",
  CONTRATISTA: "bg-orange-100 text-orange-700 border-orange-200",
  PORTERIA: "bg-slate-100 text-slate-700 border-slate-200",
  FLOTA: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

const emptyForm: UsuarioForm = { rut: "", nombre: "", email: "", password: "", roleCodigo: "SOLICITANTE" };

export default function UsuariosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<UsuarioForm>(emptyForm);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (user && !user.roles.includes("ADMIN")) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || !user.roles.includes("ADMIN")) return null;

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await apiFetch<Usuario[]>("/users");
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  const roles = ["todos", ...Object.keys(roleLabels)];

  const filtrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase();
    const matchBusqueda = !q || u.nombre.toLowerCase().includes(q) || u.rut.includes(q) || (u.email?.toLowerCase().includes(q) ?? false);
    const matchRol = filtroRol === "todos" || u.roles.some((r) => r.role.codigo === filtroRol);
    return matchBusqueda && matchRol;
  });

  function abrirModal(user?: Usuario) {
    if (user) {
      setEditandoId(user.id);
      setForm({
        rut: user.rut,
        nombre: user.nombre,
        email: user.email ?? "",
        password: "",
        roleCodigo: user.roles[0]?.role.codigo ?? "SOLICITANTE",
      });
    } else {
      setEditandoId(null);
      setForm(emptyForm);
    }
    setModalAbierto(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      if (editandoId) {
        const body: Record<string, unknown> = { nombre: form.nombre, email: form.email || null };
        if (form.password) body.password = form.password;
        await apiFetch(`/users/${editandoId}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await apiFetch("/users", {
          method: "POST",
          body: JSON.stringify({ ...form, email: form.email || undefined }),
        });
      }
      setModalAbierto(false);
      await cargarUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar usuario");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: string) {
    setEliminandoId(id);
    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" });
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar usuario");
    } finally {
      setEliminandoId(null);
    }
  }

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
          <h1 className="text-2xl font-bold text-slate-900">Usuarios del Sistema</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Administra los usuarios, roles y permisos de acceso
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-brand-navy font-semibold py-2.5 px-5 text-sm rounded-xl shadow-md shadow-brand-orange/15 hover:shadow-brand-orange/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, RUT o email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setFiltroRol(r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                filtroRol === r
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {r === "todos" ? "Todos" : roleLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20">
          <UserCog className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No se encontraron usuarios</p>
          <p className="text-slate-400 text-sm mt-1">Intenta con otros filtros o crea uno nuevo</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabla escritorio */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Nombre</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">RUT</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Email</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Rol</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Estado</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.nombre.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{u.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{u.rut}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{u.email ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleColors[u.roles[0]?.role.codigo] ?? roleColors.SOLICITANTE}`}>
                        <Shield className="w-3 h-3" />
                        {roleLabels[u.roles[0]?.role.codigo] ?? u.roles[0]?.role.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        u.activo
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => abrirModal(u)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-100 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminar(u.id)}
                          disabled={eliminandoId === u.id}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {eliminandoId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards móvil */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtrados.map((u) => (
              <div key={u.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                      {u.nombre.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{u.nombre}</p>
                      <p className="text-xs text-slate-500 font-mono">{u.rut}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => abrirModal(u)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-brand-navy">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => eliminar(u.id)} disabled={eliminandoId === u.id} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 disabled:opacity-50">
                      {eliminandoId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{u.email ?? "—"}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${roleColors[u.roles[0]?.role.codigo] ?? roleColors.SOLICITANTE}`}>
                    {roleLabels[u.roles[0]?.role.codigo] ?? u.roles[0]?.role.codigo}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    u.activo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              {filtrados.length} de {usuarios.length} usuarios
            </p>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => !guardando && setModalAbierto(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <UserCog className="w-5 h-5 text-brand-orange" />
                <h2 className="text-lg font-bold text-slate-900">
                  {editandoId ? "Editar Usuario" : "Nuevo Usuario"}
                </h2>
              </div>
              <button
                onClick={() => !guardando && setModalAbierto(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardar} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre completo</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">RUT</label>
                  <input
                    type="text"
                    value={form.rut}
                    onChange={(e) => setForm({ ...form, rut: e.target.value })}
                    required
                    disabled={!!editandoId}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange disabled:bg-slate-50 disabled:text-slate-400 font-mono"
                    placeholder="12.345.678-9"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                    placeholder="user@ejemplo.cl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Contraseña {editandoId && <span className="text-slate-400 font-normal">(dejar vacío para no cambiar)</span>}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editandoId}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                    placeholder={editandoId ? "••••••••" : "Contraseña"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rol</label>
                  <select
                    value={form.roleCodigo}
                    onChange={(e) => setForm({ ...form, roleCodigo: e.target.value })}
                    required
                    disabled={!!editandoId}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange disabled:bg-slate-50 disabled:text-slate-400 appearance-none"
                  >
                    {Object.entries(roleLabels).map(([codigo, label]) => (
                      <option key={codigo} value={codigo}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => !guardando && setModalAbierto(false)}
                  disabled={guardando}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-brand-navy font-semibold py-2.5 px-5 text-sm rounded-xl shadow-md shadow-brand-orange/15 transition-all disabled:opacity-50"
                >
                  {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {guardando ? "Guardando..." : editandoId ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
