/**
 * Smoke test HTTP de la API (Fase 2b). Requiere el server corriendo en :3001.
 *   pnpm tsx scripts/smoke-http.ts
 * Crea un permiso, lo recorre por el flujo vía endpoints y lo elimina al final.
 */
import { prisma } from "../src/lib/prisma.js";

const BASE = "http://localhost:3001/api";
let fallos = 0;
function ok(label: string, cond: boolean, extra = "") {
  console.log(`  ${cond ? "✓" : "✗"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (!cond) fallos++;
}

async function api(method: string, path: string, token?: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* sin cuerpo */
  }
  return { status: res.status, json };
}

async function login(rut: string): Promise<string> {
  const r = await api("POST", "/auth/login", undefined, { tenantSlug: "camanchaca", rut, password: "safework123" });
  if (r.status !== 200) throw new Error(`login ${rut} falló: ${r.status}`);
  return r.json.accessToken;
}

async function main() {
  console.log("🌐 Smoke test HTTP\n");

  const solicitante = await login("44.444.444-4");
  const jefe = await login("33.333.333-3");
  const sst = await login("22.222.222-2");
  console.log("  ✓ login de 3 usuarios");

  // Catálogo
  const cat = await api("GET", "/catalog", solicitante);
  ok("GET /catalog responde 200", cat.status === 200);
  const tipoG = cat.json.permitTypes.find((t: any) => t.prefijo === "G");
  const plant = cat.json.plants[0];
  const location = plant.zones[0].locations[0];

  const hoy = new Date().toISOString().slice(0, 10);

  // Crear (General interno, sin empresa)
  const crear = await api("POST", "/permits", solicitante, {
    permitTypeId: tipoG.id,
    plantId: plant.id,
    locationId: location.id,
    area: "TIERRA",
    descripcion: "Smoke test HTTP",
    fechaInicio: hoy,
  });
  ok("POST /permits → 201", crear.status === 201, crear.json?.codigo);
  const id = crear.json.id as string;

  // Listado y detalle
  const lista = await api("GET", "/permits", solicitante);
  ok("GET /permits incluye el permiso", lista.status === 200 && lista.json.some((p: any) => p.id === id));
  const detalle = await api("GET", `/permits/${id}`, solicitante);
  ok("GET /permits/:id → BORRADOR", detalle.status === 200 && detalle.json.estado === "BORRADOR");

  // Flujo interno
  const t1 = await api("POST", `/permits/${id}/avanzar`, solicitante);
  ok("avanzar (solicitante) → PENDIENTE_JEFE_AREA", t1.status === 200 && t1.json.estado === "PENDIENTE_JEFE_AREA");
  const t2 = await api("POST", `/permits/${id}/avanzar`, jefe);
  ok("avanzar (jefe) → PENDIENTE_SST", t2.status === 200 && t2.json.estado === "PENDIENTE_SST");
  const t3 = await api("POST", `/permits/${id}/avanzar`, sst, { firma: { tipo: "FIRMA_SST" } });
  ok("avanzar (sst + firma) → ACTIVO", t3.status === 200 && t3.json.estado === "ACTIVO");

  // Control de acceso + suspender/reactivar
  const s403 = await api("POST", `/permits/${id}/suspender`, solicitante, { motivo: "intento no autorizado" });
  ok("solicitante NO puede suspender → 403", s403.status === 403);
  const sus = await api("POST", `/permits/${id}/suspender`, sst, { motivo: "Falta extintor" });
  ok("sst suspende → SUSPENDIDO", sus.status === 200 && sus.json.estado === "SUSPENDIDO");
  const rea = await api("POST", `/permits/${id}/reactivar`, sst);
  ok("sst reactiva → ACTIVO", rea.status === 200 && rea.json.estado === "ACTIVO");

  // Cierre manual anticipado
  const cer = await api("POST", `/permits/${id}/cerrar`, solicitante);
  ok("cierre manual → CERRADO", cer.status === 200 && cer.json.estado === "CERRADO");

  // Validación de entrada (zod) → 400
  const malo = await api("POST", "/permits", solicitante, { descripcion: "x" });
  ok("POST /permits inválido → 400", malo.status === 400);

  // Limpieza
  await prisma.permit.delete({ where: { id } }).catch(() => {});
  console.log("\n🧹 Permiso de prueba eliminado");

  console.log(`\n${fallos === 0 ? "✅ TODOS LOS CHECKS PASARON" : `❌ ${fallos} CHECK(S) FALLARON`}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(fallos === 0 ? 0 : 1);
  })
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
