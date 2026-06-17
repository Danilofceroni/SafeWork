"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  Users,
  Bell,
  Palette,
  Shield,
  Globe,
  Mail,
  Lock,
  ChevronRight,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useState } from "react";

type SeccionConfiguracion = {
  id: string;
  titulo: string;
  descripcion: string;
  icono: typeof Building2;
  color: string;
  fondo: string;
};

const secciones: SeccionConfiguracion[] = [
  { id: "empresa", titulo: "Datos de la Empresa", descripcion: "Información general, logo y datos de contacto", icono: Building2, color: "text-blue-600", fondo: "bg-blue-50" },
  { id: "usuarios", titulo: "Gestión de Usuarios", descripcion: "Roles, permisos de acceso y administradores", icono: Users, color: "text-violet-600", fondo: "bg-violet-50" },
  { id: "notificaciones", titulo: "Notificaciones", descripcion: "Alertas por correo, push y configuración de avisos", icono: Bell, color: "text-amber-600", fondo: "bg-amber-50" },
  { id: "apariencia", titulo: "Apariencia", descripcion: "Colores corporativos, logo y personalización visual", icono: Palette, color: "text-pink-600", fondo: "bg-pink-50" },
  { id: "seguridad", titulo: "Seguridad", descripcion: "Autenticación, contraseñas y acceso de red", icono: Lock, color: "text-red-600", fondo: "bg-red-50" },
  { id: "integraciones", titulo: "Integraciones", descripcion: "Conexiones con sistemas externos y APIs", icono: Globe, color: "text-emerald-600", fondo: "bg-emerald-50" },
];

export default function ConfigPage() {
  const [notifCorreo, setNotifCorreo] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifVencimiento, setNotifVencimiento] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
      className="space-y-6"
    >
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-600 mt-1 text-sm">
          Administra la configuración general de tu organización
        </p>
      </div>

      {/* Tarjeta de la Organización */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            C
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">Camanchaca Pesca Sur S.A.</h2>
            <p className="text-sm text-slate-500">Planta Coronel — Región del Biobío</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Plan Activo
          </span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">RUT Empresa</p>
            <p className="text-sm font-semibold text-slate-900">81.095.400-4</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Contacto</p>
            <p className="text-sm text-slate-700">operaciones@camanchaca.cl</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Plan</p>
            <p className="text-sm font-semibold text-brand-orange">SafeWork Enterprise</p>
          </div>
        </div>
      </div>

      {/* Cuadrícula de Secciones de Configuración */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {secciones.map((sec) => (
          <button
            key={sec.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 cursor-pointer group text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 ${sec.fondo} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <sec.icono className={`w-5 h-5 ${sec.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 group-hover:text-brand-navy transition-colors">{sec.titulo}</p>
                <p className="text-xs text-slate-500 mt-0.5">{sec.descripcion}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-navy transition-colors flex-shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>

      {/* Preferencias de Notificaciones */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-900">Preferencias de Notificaciones</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { label: "Notificaciones por correo", desc: "Recibir alertas de permisos por email", value: notifCorreo, setter: setNotifCorreo, icon: Mail },
            { label: "Notificaciones push", desc: "Alertas en tiempo real en el navegador", value: notifPush, setter: setNotifPush, icon: Bell },
            { label: "Alertas de vencimiento", desc: "Aviso 1 hora antes del vencimiento de un permiso", value: notifVencimiento, setter: setNotifVencimiento, icon: Shield },
          ].map((item) => (
            <div key={item.label} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
                  <item.icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => item.setter(!item.value)}
                aria-pressed={item.value}
                aria-label={item.label}
                className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${item.value ? "text-brand-orange" : "text-slate-300"}`}
              >
                {item.value ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
