# Guía de colaboración — SafeWork

Para que el equipo trabaje sin pisarse, seguimos un flujo simple basado en **ramas** y
**Pull Requests (PR)**. Toma 2 minutos para leer esto antes de tu primer commit.

---

## Regla de oro

> **Nadie trabaja ni hace push directo sobre `main`.**
> `main` siempre debe estar estable y funcionando. Todo cambio entra por Pull Request.

---

## Flujo de trabajo

### 1. Antes de empezar, actualiza `main`

```bash
git checkout main
git pull origin main
```

### 2. Crea tu rama de trabajo

Usa un nombre descriptivo con prefijo `feature/`, `fix/` o `docs/`:

```bash
git checkout -b feature/login
```

### 3. Trabaja y haz commits en tu rama

```bash
git add -A
git commit -m "feat: formulario de login y llamada a /auth/login"
```

Mensajes de commit recomendados (formato corto y claro):

| Prefijo | Cuándo |
|---|---|
| `feat:` | Funcionalidad nueva |
| `fix:` | Corrección de un error |
| `docs:` | Documentación |
| `refactor:` | Reorganizar código sin cambiar comportamiento |
| `chore:` | Tareas varias (configuración, dependencias) |

### 4. Sube tu rama

```bash
git push origin feature/login
```

### 5. Abre un Pull Request en GitHub

- Entra al repo en GitHub y usa el botón **"Compare & pull request"**.
- Describe brevemente qué hiciste.
- Pide revisión a un compañero antes de fusionar a `main`.

---

## Cómo mantener tu rama al día (evitar conflictos)

Si mientras trabajas alguien fusionó cambios a `main`, tráelos a tu rama con frecuencia:

```bash
git checkout main
git pull origin main          # traer lo último
git checkout feature/login
git rebase main               # montar tu trabajo encima de lo nuevo
```

### Si aparece un conflicto

**En `pnpm-lock.yaml`** (lo más común). Lo más simple es regenerarlo:

```bash
rm frontend/pnpm-lock.yaml    # o backend/pnpm-lock.yaml, según cuál choque
pnpm install
git add pnpm-lock.yaml
git rebase --continue
```

**En archivos de código.** Git marca las zonas en conflicto con `<<<<<<<`, `=======` y
`>>>>>>>`. Abre el archivo, deja la versión correcta, borra esas marcas y luego:

```bash
git add <archivo>
git rebase --continue
```

---

## Si empezaste sobre una versión antigua del repo

(Por ejemplo, clonaste cuando solo estaba el mockup y ya hiciste cambios.)

```bash
# 1) Guarda tu trabajo actual en una rama propia (no se pierde nada)
git add -A
git commit -m "WIP: mi trabajo"
git branch mi-trabajo

# 2) Actualiza main
git checkout main
git pull origin main

# 3) Monta tu trabajo encima de lo nuevo
git checkout mi-trabajo
git rebase main
# (resuelve conflictos si aparecen, ver la sección anterior)

# 4) Sube y abre un PR
git push origin mi-trabajo
```

---

## Cosas que NO se suben al repo

- Archivos `.env` y `.env.local` (tienen secretos). Usa los `.env.example` como plantilla.
- `node_modules/` (se regenera con `pnpm install`).
- Carpetas generadas (`backend/generated/`, `dist/`, `.next/`).

Si algo de esto te aparece para hacer commit, **no lo agregues** y avisa para revisar el `.gitignore`.

---

## Dudas

Ante cualquier problema con Git o con el setup, escríbelo en el grupo antes de forzar comandos
(`git push --force`, `git reset --hard`) que pueden borrar el trabajo de otros.
