"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  FileCheck,
  Users,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Search,
  Menu,
  X,
  Building2,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Permisos de Trabajo", href: "/dashboard/permisos", icon: ClipboardList },
  { label: "Trabajadores", href: "/dashboard/trabajadores", icon: Users },
  { label: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
];

const bottomNavItems = [
  { label: "Configuración", href: "/dashboard/config", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-surface flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[272px] bg-brand-navy flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-orange rounded-lg flex items-center justify-center shadow-md shadow-brand-orange/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">SafeWork</h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tenant Selector */}
        <div className="px-4 py-4">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-white/70" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Camanchaca Pesca Sur</p>
              <p className="text-xs text-white/40">Planta Coronel</p>
            </div>
            <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider px-3 mb-3">
            Principal
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
                    : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-white" : "text-white/40 group-hover:text-white/70"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Nav */}
        <div className="px-4 pb-2 space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-brand-orange text-white"
                    : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0 text-white/40 group-hover:text-white/70" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              CA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Carlos Araya</p>
              <p className="text-xs text-white/40 truncate">Administrador</p>
            </div>
            <Link href="/" className="text-white/30 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-[72px] bg-white border-b border-brand-border flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-brand-muted hover:text-brand-text"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-brand-surface rounded-xl px-4 py-2.5 w-80 border border-brand-border/50">
              <Search className="w-4 h-4 text-brand-muted" />
              <input
                type="text"
                placeholder="Buscar permisos, trabajadores..."
                className="bg-transparent text-sm text-brand-text placeholder:text-brand-muted outline-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative w-10 h-10 rounded-xl bg-brand-surface hover:bg-slate-100 flex items-center justify-center transition-colors border border-brand-border/50">
              <Bell className="w-[18px] h-[18px] text-brand-muted" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-status-critical rounded-full" />
            </button>

            {/* User Menu */}
            <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-brand-border">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">Carlos Araya</p>
                <p className="text-xs text-slate-500">Administrador</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold">
                CA
              </div>
              <Link 
                href="/" 
                className="ml-2 flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
