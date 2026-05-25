# SafeWork - Sistema de Permisos de Trabajo (SaaS)

Este repositorio contiene la plataforma SafeWork, dividida en un entorno Frontend (Next.js) y un Backend (Express + Prisma).

## Arquitectura

- **Frontend:** Next.js 15+, Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend:** Node.js, Express, Prisma ORM, TypeScript.

---

## 🚀 Guía de Inicio Rápido para Desarrollo

### 1. Configurar y Levantar el Backend (Puerto 3001)

1. Abre una terminal y navega al directorio del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias usando `pnpm` (el package manager oficial del proyecto):
   ```bash
   pnpm install
   ```
3. Configura tus variables de entorno locales:
   * Copia el archivo `.env.example` y renómbralo a `.env`.
   * Ajusta los valores de la base de datos si es necesario.
4. Levanta el servidor en modo desarrollo:
   ```bash
   pnpm dev
   ```
   > El backend estará corriendo en `http://localhost:3001`

### 2. Configurar y Levantar el Frontend (Puerto 3000)

1. Abre **otra** terminal y navega al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   pnpm install
   ```
3. Configura tus variables de entorno locales:
   * Copia el archivo `.env.example` y renómbralo a `.env`.
   * Asegúrate de que `NEXT_PUBLIC_API_URL` apunte a `http://localhost:3001`.
4. Levanta el entorno de desarrollo de Next.js:
   ```bash
   pnpm dev
   ```
   > El frontend estará disponible en `http://localhost:3000`

---

## Distribución de Trabajo (Flujo Recomendado)
* No suban sus archivos `.env` al repositorio.
* Realicen el código en ramas locales antes de fusionar a la rama `main`.
