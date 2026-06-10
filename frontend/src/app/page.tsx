"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Shield, Eye, EyeOff, ArrowRight, Lock, User, Building2 } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen flex">
      {/* Panel Izquierdo - Identidad Visual (Sin cambios) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-navy relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        {/* Logotipo */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-brand-orange rounded-xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <Shield className="w-6 h-6 text-brand-navy" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">SafeWork</h1>
              <p className="text-xs text-white/50 font-medium tracking-wider uppercase">Industrial Safety Platform</p>
            </div>
          </div>
        </motion.div>

        {/* Contenido Central */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : 0.2 }}
          className="relative z-10 space-y-6"
        >
          <h2 className="text-4xl font-bold text-white leading-tight">
            Gestión de Permisos<br />
            de Trabajo<br />
            <span className="text-brand-orange">Inteligente</span>
          </h2>
          <p className="text-white/60 text-lg max-w-md leading-relaxed">
            Controla, autoriza y supervisa permisos de trabajo en tiempo real.
            Cumplimiento normativo garantizado.
          </p>

          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-white">99.8%</p>
              <p className="text-sm text-white/40 mt-1">Disponibilidad</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-3xl font-bold text-white">+2,500</p>
              <p className="text-sm text-white/40 mt-1">Permisos gestionados</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-sm text-white/40 mt-1">Incidentes</p>
            </div>
          </div>
        </motion.div>

        {/* Pie de Página */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.5 }}
          className="relative z-10"
        >
          <p className="text-white/30 text-sm">
            &copy; 2026 SafeWork SaaS. Todos los derechos reservados.
          </p>
        </motion.div>
      </div>

      {/* Panel Derecho - Formulario de Login */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-brand-surface">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.1 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-navy rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-brand-navy">SafeWork</h1>
          </div>

          {/* Insignia de la Organización */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : 0.3 }}
            className="mb-8 p-4 bg-white rounded-xl border border-brand-border shadow-sm flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Organización</p>
              <p className="text-sm font-semibold text-slate-900">Camanchaca Pesca Sur S.A.</p>
            </div>
          </motion.div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Bienvenido</h2>
            <p className="text-slate-600 mt-2">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="rut-input" className="block text-sm font-semibold text-slate-700 mb-2">
                RUT o Correo Electrónico
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="rut-input"
                  type="text"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder:text-slate-500"
                  placeholder="12.345.678-9"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password-input" className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder:text-slate-500"
                  placeholder="Ingrese su contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-brand-orange focus:ring-brand-orange/30" />
                <span className="text-sm text-slate-600">Recordar sesión</span>
              </label>
              <a href="#" className="text-sm text-brand-navy hover:text-brand-orange font-medium">
                Recuperar contraseña
              </a>
            </div>

            <Link
              href="/dashboard"
              className="w-full bg-brand-orange hover:bg-brand-orange-dark text-brand-navy font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/30 hover:translate-y-[-1px] active:translate-y-0 mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <ArrowRight className="w-4.5 h-4.5" />
              )}
              {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              SafeWork v1.0.0 — Plataforma de Seguridad Industrial
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}