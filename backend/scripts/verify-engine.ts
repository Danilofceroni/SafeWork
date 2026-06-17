/**
 * Verificación end-to-end del motor de estados (Fase 2) contra la BD sembrada.
 * Ejecuta los flujos clave del motor y limpia lo que crea (re-ejecutable).
 *
 *   pnpm tsx scripts/verify-engine.ts
 */
import { DateTime } from "luxon";
import { prisma } from "../src/lib/prisma.js";
import { DomainError } from "../src/lib/errors.js";
import {
  crearPermiso,
  avanzarPermiso,
  devolverPermiso,
  rechazarPermiso,
  cerrarPermiso,
  suspenderPermiso,
  reactivarPermiso,
  type Actor,
} from "../src/services/permit.service.js";

let fallos = 0;
const creados: string[] = []; // ids de permisos creados (para limpiar)

function ok(label: string, cond: boolean, extra = "") {
  console.log(`  ${cond ? "✓" : "✗"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (!cond) fallos++;
}

async function esperaError(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    ok(label, false, "no lanzó error");
  } catch (e) {
    ok(label, e instanceof DomainError, e instanceof Error ? e.message : String(e));
  }
}

async function crear(input: Parameters<typeof crearPermiso>[0], actor: Actor) {
  const p = await crearPermiso(input, actor);
  creados.push(p.id);
  return p;
}

async function main() {
  console.log("🔧 Verificación del motor de estados\n");

  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { slug: "camanchaca" } });
  const tenantId = tenant.id;
  const tz = tenant.timezone;
  const hoy = DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");

  // --- actores ---
  async function actor(rut: string): Promise<Actor> {
    const u = await prisma.user.findFirstOrThrow({
      where: { tenantId, rut },
      include: { roles: { include: { role: true } } },
    });
    return { tenantId, userId: u.id, roles: u.roles.map((r) => r.role.codigo), companyId: u.companyId };
  }
  const admin = await actor("11.111.111-1");
  const sst = await actor("22.222.222-2");
  const jefe = await actor("33.333.333-3");
  const solicitante = await actor("44.444.444-4");
  const contratista = await actor("55.555.555-5");

  // --- catálogos ---
  const tipoG = await prisma.permitType.findFirstOrThrow({ where: { tenantId, prefijo: "G" } });
  const tipoC = await prisma.permitType.findFirstOrThrow({ where: { tenantId, prefijo: "C" } });
  const tipoH = await prisma.permitType.findFirstOrThrow({ where: { tenantId, prefijo: "H" } });
  const plant = await prisma.plant.findFirstOrThrow({ where: { tenantId, sigla: "CS" } });
  const location = await prisma.location.findFirstOrThrow({ where: { tenantId } });
  const externa = await prisma.company.findFirstOrThrow({ where: { tenantId, tipo: "EXTERNA" } });

  const baseInput = { plantId: plant.id, locationId: location.id, area: "TIERRA" as const, fechaInicio: hoy };

  // ============================================================
  // A. Flujo EXTERNO (Crítico, empresa externa) — sin saltos
  // ============================================================
  console.log("A. Flujo externo (Crítico):");
  let pA = await crear(
    { ...baseInput, permitTypeId: tipoC.id, companyId: externa.id, descripcion: "Mantención crítica externa" },
    solicitante,
  );
  ok("crea en BORRADOR", pA.estado === "BORRADOR");
  ok("código con formato PTW-C-CS-AAAA-#####", /^PTW-C-CS-\d{4}-\d{5}$/.test(pA.codigo), pA.codigo);

  pA = await avanzarPermiso(pA.id, solicitante);
  ok("→ PENDIENTE_CONTRATISTA", pA.estado === "PENDIENTE_CONTRATISTA");
  pA = await avanzarPermiso(pA.id, contratista);
  ok("→ PENDIENTE_SOLICITANTE (sin salto, es externo)", pA.estado === "PENDIENTE_SOLICITANTE");
  pA = await avanzarPermiso(pA.id, solicitante);
  ok("→ PENDIENTE_JEFE_AREA", pA.estado === "PENDIENTE_JEFE_AREA");
  pA = await avanzarPermiso(pA.id, jefe);
  ok("→ PENDIENTE_SST", pA.estado === "PENDIENTE_SST");
  pA = await avanzarPermiso(pA.id, sst, { firma: { tipo: "FIRMA_SST" } });
  ok("→ ACTIVO (SST autoriza + firma)", pA.estado === "ACTIVO");

  // ============================================================
  // B. Salto INTERNO (General, sin empresa): omite SOLO al contratista
  // ============================================================
  console.log("\nB. Salto interno (General, sin empresa):");
  let pB = await crear({ ...baseInput, permitTypeId: tipoG.id, descripcion: "Trabajo general interno" }, solicitante);
  pB = await avanzarPermiso(pB.id, solicitante);
  ok("salta SOLO contratista → PENDIENTE_JEFE_AREA", pB.estado === "PENDIENTE_JEFE_AREA");
  pB = await avanzarPermiso(pB.id, jefe);
  ok("jefe de área revisa → PENDIENTE_SST", pB.estado === "PENDIENTE_SST");

  // ============================================================
  // C. Devolver (OBSERVADO) + reanudar
  // ============================================================
  console.log("\nC. Devolver y reanudar:");
  pB = await devolverPermiso(pB.id, "Falta detalle de la tarea", sst);
  ok("→ OBSERVADO", pB.estado === "OBSERVADO");
  pB = await avanzarPermiso(pB.id, solicitante);
  ok("reanuda al estado de origen (PENDIENTE_SST)", pB.estado === "PENDIENTE_SST");

  // ============================================================
  // D. Rechazar (terminal) y bloqueo posterior
  // ============================================================
  console.log("\nD. Rechazar:");
  pB = await rechazarPermiso(pB.id, "No cumple requisitos", sst);
  ok("→ RECHAZADO", pB.estado === "RECHAZADO");
  await esperaError("avanzar un permiso terminal lanza error", () => avanzarPermiso(pB.id, admin));

  // ============================================================
  // E. Caliente EXTERNO — cierre con 3 firmas
  // ============================================================
  console.log("\nE. Caliente externo (cierre 3 firmas):");
  let pE = await crear(
    { ...baseInput, permitTypeId: tipoH.id, companyId: externa.id, permisoPadreId: pA.id, descripcion: "Soldadura en caliente" },
    solicitante,
  );
  ok("vinculado a permiso padre", pE.permisoPadreId === pA.id);
  pE = await avanzarPermiso(pE.id, solicitante); // → PENDIENTE_CONTRATISTA
  pE = await avanzarPermiso(pE.id, contratista); // → PENDIENTE_SOLICITANTE
  pE = await avanzarPermiso(pE.id, solicitante); // → PENDIENTE_JEFE_AREA
  pE = await avanzarPermiso(pE.id, jefe); // → PENDIENTE_SST
  pE = await avanzarPermiso(pE.id, sst); // → ACTIVO
  ok("llega a ACTIVO", pE.estado === "ACTIVO");
  pE = await avanzarPermiso(pE.id, contratista); // ACTIVO → PENDIENTE_CIERRE_SOLICITANTE
  ok("inicia cierre → PENDIENTE_CIERRE_SOLICITANTE", pE.estado === "PENDIENTE_CIERRE_SOLICITANTE");
  pE = await avanzarPermiso(pE.id, solicitante); // → PENDIENTE_CIERRE_JEFE_AREA (sin salto, externo)
  ok("→ PENDIENTE_CIERRE_JEFE_AREA (externo, sin salto)", pE.estado === "PENDIENTE_CIERRE_JEFE_AREA");
  pE = await avanzarPermiso(pE.id, jefe); // → CERRADO
  ok("→ CERRADO (3ra firma)", pE.estado === "CERRADO");
  ok("registra fechaCierre", pE.fechaCierre !== null);

  // ============================================================
  // F. Caliente INTERNO — cierre con 2 firmas (salto)
  // ============================================================
  console.log("\nF. Caliente interno (cierre 2 firmas):");
  let pF = await crear(
    { ...baseInput, permitTypeId: tipoH.id, permisoPadreId: pA.id, descripcion: "Caliente interno" },
    solicitante,
  );
  pF = await avanzarPermiso(pF.id, solicitante); // salto interno → PENDIENTE_JEFE_AREA
  ok("intake interno → PENDIENTE_JEFE_AREA (omite contratista)", pF.estado === "PENDIENTE_JEFE_AREA");
  pF = await avanzarPermiso(pF.id, jefe); // → PENDIENTE_SST
  pF = await avanzarPermiso(pF.id, sst); // → ACTIVO
  pF = await avanzarPermiso(pF.id, solicitante); // ACTIVO → PENDIENTE_CIERRE_SOLICITANTE
  ok("inicia cierre → PENDIENTE_CIERRE_SOLICITANTE", pF.estado === "PENDIENTE_CIERRE_SOLICITANTE");
  pF = await avanzarPermiso(pF.id, jefe); // salto interno → CERRADO (2da firma)
  ok("cierre interno SALTA a CERRADO (2 firmas)", pF.estado === "CERRADO");

  // ============================================================
  // G. Correlativo del código
  // ============================================================
  console.log("\nG. Correlativo de código:");
  const g1 = await crear({ ...baseInput, permitTypeId: tipoC.id, companyId: externa.id, descripcion: "Corr 1" }, solicitante);
  const g2 = await crear({ ...baseInput, permitTypeId: tipoC.id, companyId: externa.id, descripcion: "Corr 2" }, solicitante);
  const n1 = parseInt(g1.codigo.split("-").pop() ?? "0", 10);
  const n2 = parseInt(g2.codigo.split("-").pop() ?? "0", 10);
  ok("correlativo incrementa en 1", n2 === n1 + 1, `${g1.codigo} → ${g2.codigo}`);

  // ============================================================
  // H. Cálculo de vencimiento
  // ============================================================
  console.log("\nH. Vencimiento (timezone del tenant):");
  const venceG = DateTime.fromJSDate(g1.fechaVencimiento, { zone: tz });
  const finMes = DateTime.fromFormat(hoy, "yyyy-MM-dd", { zone: tz }).endOf("month");
  ok("General vence el último día del mes 23:59", venceG.hasSame(finMes, "day") && venceG.hour === 23, venceG.toISO() ?? "");
  const venceH = DateTime.fromJSDate(pF.fechaVencimiento, { zone: tz });
  const hoyDt = DateTime.fromFormat(hoy, "yyyy-MM-dd", { zone: tz });
  ok("Caliente (1 día) vence hoy 23:59", venceH.hasSame(hoyDt, "day") && venceH.hour === 23, venceH.toISO() ?? "");

  // helpers: llevar un permiso a ACTIVO
  async function generalInternoActivo(desc: string) {
    let p = await crear({ ...baseInput, permitTypeId: tipoG.id, descripcion: desc }, solicitante);
    p = await avanzarPermiso(p.id, solicitante); // → PENDIENTE_JEFE_AREA (salto interno)
    p = await avanzarPermiso(p.id, jefe); // → PENDIENTE_SST
    p = await avanzarPermiso(p.id, sst); // → ACTIVO
    return p;
  }
  async function calienteExternoActivo(desc: string) {
    let p = await crear(
      { ...baseInput, permitTypeId: tipoH.id, companyId: externa.id, permisoPadreId: pA.id, descripcion: desc },
      solicitante,
    );
    p = await avanzarPermiso(p.id, solicitante);
    p = await avanzarPermiso(p.id, contratista);
    p = await avanzarPermiso(p.id, solicitante);
    p = await avanzarPermiso(p.id, jefe);
    p = await avanzarPermiso(p.id, sst);
    return p;
  }

  // ============================================================
  // J. Cierre manual anticipado (G/C) y bloqueo en Caliente
  // ============================================================
  console.log("\nJ. Cierre manual anticipado:");
  const pJ = await generalInternoActivo("Cierre anticipado");
  const cerrado = await cerrarPermiso(pJ.id, solicitante);
  ok("General activo se cierra manualmente → CERRADO", cerrado.estado === "CERRADO" && cerrado.fechaCierre !== null);
  const pCaliente = await calienteExternoActivo("Bloqueo cierre manual");
  await esperaError("Caliente NO permite cierre manual directo (usa firmas)", () => cerrarPermiso(pCaliente.id, sst));

  // ============================================================
  // K. Suspender / reactivar (SST)
  // ============================================================
  console.log("\nK. Suspender / reactivar:");
  let pK = await generalInternoActivo("Suspensión");
  await esperaError("Solicitante NO puede suspender", () => suspenderPermiso(pK.id, "intento", solicitante));
  pK = await suspenderPermiso(pK.id, "Falta extintor en el área", sst);
  ok("SST suspende → SUSPENDIDO", pK.estado === "SUSPENDIDO");
  await esperaError("no se puede avanzar un permiso suspendido", () => avanzarPermiso(pK.id, sst));
  pK = await reactivarPermiso(pK.id, sst);
  ok("SST reactiva → ACTIVO", pK.estado === "ACTIVO");

  // ============================================================
  // I. Rol no autorizado
  // ============================================================
  console.log("\nI. Control de acceso:");
  const pI = await crear({ ...baseInput, permitTypeId: tipoG.id, descripcion: "Control rol" }, solicitante);
  await esperaError("contratista no puede mover desde BORRADOR", () => avanzarPermiso(pI.id, contratista));

  // --- limpieza (hijos antes que padres: orden inverso de creación) ---
  for (const id of [...creados].reverse()) {
    await prisma.permit.delete({ where: { id } }).catch(() => {});
  }
  console.log(`\n🧹 Limpieza: ${creados.length} permisos de prueba eliminados`);

  console.log(`\n${fallos === 0 ? "✅ TODOS LOS CHECKS PASARON" : `❌ ${fallos} CHECK(S) FALLARON`}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(fallos === 0 ? 0 : 1);
  })
  .catch(async (e) => {
    console.error("❌ Error inesperado:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
