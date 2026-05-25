import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeWork — Gestión de Permisos de Trabajo",
  description: "Plataforma SaaS para la gestión integral de permisos de trabajo en la industria pesquera. Control, autorización y supervisión en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

