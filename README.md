# SafeWork — Sistema de Permisos de Trabajo (SaaS)

Plataforma **SaaS multi-tenant** para la gestión de **Permisos de Trabajo de alto riesgo (PTW)**
en la industria. Permite configurar tipos de permiso, flujos de aprobación, roles y formularios
por empresa, sin reprogramar. Dividida en **Frontend** (Next.js) y **Backend** (Express + Prisma).

> Documentación técnica en [`docs/`](./docs):
> [arquitectura del backend](./docs/arquitectura-backend.md) · [benchmark competitivo](./docs/benchmark-competencia.md).

---

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend:** Node.js, Express 5, Prisma 7 (PostgreSQL), TypeScript, JWT, Zod, Luxon.
- **Gestor de paquetes:** **pnpm** (oficial del proyecto).

## Requisitos previos

- **Node.js** 20 o superior
- **pnpm** (`npm install -g pnpm`)
- **PostgreSQL** corriendo localmente
  - Opción simple sin instalar nada: `npx prisma dev` levanta un Postgres local de Prisma.
    Ajustá `DATABASE_URL` en `backend/.env` al puerto que indique.

---

## Guía de inicio rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/Danilofceroni/SafeWork.git
cd SafeWork
```

### 2. Backend (puerto 3001)

```bash
cd backend
pnpm install

# Variables de entorno: copiar la plantilla y completar valores
cp .env.example .env        # Windows (PowerShell):  copy .env.example .env

# Generar el cliente de Prisma, crear las tablas y cargar datos demo
pnpm db:generate
pnpm db:push
pnpm db:seed                # importante: sin esto no hay usuarios ni datos para probar

# Levantar el servidor en modo desarrollo
pnpm dev                    # http://localhost:3001
```

Variables en `backend/.env`:

| Variable | Para qué |
|---|---|
| `PORT` | Puerto del backend (por defecto `3001`) |
| `DATABASE_URL` | Conexión a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar el access token |
| `JWT_REFRESH_SECRET` | Secreto para firmar el refresh token |
| `NODE_ENV` | `development` / `production` |

### 3. Frontend (puerto 3000)

En **otra** terminal:

```bash
cd frontend
pnpm install

# Variables de entorno
cp .env.example .env.local   # Windows (PowerShell):  copy .env.example .env.local
# Asegurate de que NEXT_PUBLIC_API_URL apunte a http://localhost:3001

pnpm dev                     # http://localhost:3000
```

> Los archivos `.env` y `.env.local` **nunca** se suben al repo (tienen secretos).
> Cada uno crea el suyo a partir del `.env.example`.

---

## Credenciales demo

Tras correr `pnpm db:seed`, el tenant demo es **`camanchaca`** y la contraseña de todos es **`safework123`**:

| Rol | RUT |
|---|---|
| Admin | `11.111.111-1` |
| SST (prevencionista) | `22.222.222-2` |
| Jefe de área | `33.333.333-3` |
| Solicitante | `44.444.444-4` |
| Contratista | `55.555.555-5` |
| Portería | `66.666.666-6` |

---

## Scripts útiles (backend)

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Levanta el servidor en modo watch |
| `pnpm build` | Compila TypeScript a `dist/` |
| `pnpm db:push` | Aplica el schema de Prisma a la base de datos |
| `pnpm db:seed` | Carga datos demo (idempotente, se puede correr varias veces) |
| `pnpm verify:engine` | Verifica el motor de estados |
| `pnpm verify:validator` | Verifica el validador de workflows |
| `pnpm smoke:http` | Prueba humo de las rutas HTTP (con el server arriba) |

---

## Cómo colaborar

**Nadie trabaja directo sobre `main`.** Antes de empezar, lee [**CONTRIBUTING.md**](./CONTRIBUTING.md):
explica el flujo de ramas y Pull Requests para que el equipo no se pise.
