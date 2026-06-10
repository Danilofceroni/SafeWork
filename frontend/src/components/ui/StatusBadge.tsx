type StatusBadgeProps = {
  estado: "activo" | "pendiente" | "cerrado" | "vencido" | "inactivo" | "licencia";
};

const config: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  activo:   { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500",  label: "Activo"   },
  pendiente:{ bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500",    label: "Pendiente"},
  cerrado:  { bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400",    label: "Cerrado"  },
  vencido:  { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500",      label: "Vencido"  },
  inactivo: { bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400",    label: "Inactivo" },
  licencia: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500",    label: "Licencia" },
};

export function StatusBadge({ estado }: StatusBadgeProps) {
  const c = config[estado] ?? config.cerrado;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
