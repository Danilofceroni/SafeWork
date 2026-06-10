import { type ButtonHTMLAttributes, type ReactNode } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: "sm" | "md";
};

export function PrimaryButton({ children, size = "md", className = "", ...props }: PrimaryButtonProps) {
  const padding = size === "sm" ? "py-2 px-4 text-xs" : "py-2.5 px-5 text-sm";
  return (
    <button
      className={`inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-brand-navy font-semibold ${padding} rounded-xl shadow-md shadow-brand-orange/15 hover:shadow-brand-orange/25 transition-all hover:-translate-y-0.5 active:translate-y-0 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
