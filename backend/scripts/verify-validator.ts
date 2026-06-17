/**
 * Verificación del validador de workflows.
 *   pnpm tsx scripts/verify-validator.ts
 */
import { prisma } from "../src/lib/prisma.js";
import { validarWorkflow, validarWorkflowEnBD, type PasoConfig } from "../src/services/workflow.validator.js";

let fallos = 0;
function ok(label: string, cond: boolean, extra = "") {
  console.log(`  ${cond ? "✓" : "✗"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (!cond) fallos++;
}

const ROLES = ["ADMIN", "SST", "JEFE_AREA", "SOLICITANTE", "CONTRATISTA"];
const opt = { cierreManual: false, rolesValidos: ROLES };

// Flujo mínimo válido (sin cierre manual): BORRADOR → PENDIENTE_SST → ACTIVO
const flujoOk: PasoConfig[] = [
  { orden: 1, estadoDesde: "BORRADOR", estadoHasta: "PENDIENTE_SST", rolesPermitidos: ["SOLICITANTE"] },
  { orden: 2, estadoDesde: "PENDIENTE_SST", estadoHasta: "ACTIVO", rolesPermitidos: ["SST"] },
];

async function main() {
  console.log("🔧 Verificación del validador de workflows\n");

  // --- Flujos sembrados (deben ser válidos) ---
  console.log("Flujos sembrados:");
  const workflows = await prisma.workflow.findMany({ where: { tenant: { slug: "camanchaca" } } });
  for (const wf of workflows) {
    const r = await validarWorkflowEnBD(wf.id, wf.tenantId);
    ok(`"${wf.nombre}" es válido`, r.valido, r.errores.join(" | "));
  }

  // --- Casos válidos (función pura) ---
  console.log("\nCasos válidos:");
  ok("flujo mínimo válido", validarWorkflow(flujoOk, opt).valido);

  // --- Casos inválidos ---
  console.log("\nCasos inválidos (deben fallar con el error correcto):");

  const sinInicio = flujoOk.filter((p) => p.estadoDesde !== "BORRADOR");
  const r1 = validarWorkflow(sinInicio, opt);
  ok("detecta falta de paso inicial", !r1.valido && r1.errores.some((e) => e.includes("inicial")), r1.errores.join(" | "));

  const sinActivo: PasoConfig[] = [
    { orden: 1, estadoDesde: "BORRADOR", estadoHasta: "PENDIENTE_SST", rolesPermitidos: ["SOLICITANTE"] },
  ];
  const r2 = validarWorkflow(sinActivo, opt);
  ok("detecta callejón / sin camino a ACTIVO", !r2.valido && r2.errores.some((e) => e.includes("ACTIVO")), r2.errores.join(" | "));

  const rolMalo: PasoConfig[] = [
    { orden: 1, estadoDesde: "BORRADOR", estadoHasta: "PENDIENTE_SST", rolesPermitidos: ["GERENTE"] },
    { orden: 2, estadoDesde: "PENDIENTE_SST", estadoHasta: "ACTIVO", rolesPermitidos: ["SST"] },
  ];
  const r3 = validarWorkflow(rolMalo, opt);
  ok("detecta rol inexistente", !r3.valido && r3.errores.some((e) => e.includes("GERENTE")), r3.errores.join(" | "));

  const cierreSinCerrado: PasoConfig[] = [...flujoOk];
  const r4 = validarWorkflow(cierreSinCerrado, { ...opt, cierreManual: true });
  ok("detecta cierre manual sin camino a CERRADO", !r4.valido && r4.errores.some((e) => e.includes("CERRADO")), r4.errores.join(" | "));

  const condMala: PasoConfig[] = [
    { orden: 1, estadoDesde: "BORRADOR", estadoHasta: "PENDIENTE_SST", rolesPermitidos: ["SOLICITANTE"], condicionSalto: "gerente.humor==feliz", estadoHastaSalto: "ACTIVO" },
    { orden: 2, estadoDesde: "PENDIENTE_SST", estadoHasta: "ACTIVO", rolesPermitidos: ["SST"] },
  ];
  const r5 = validarWorkflow(condMala, opt);
  ok("detecta condición de salto no soportada", !r5.valido && r5.errores.some((e) => e.includes("no soportada")), r5.errores.join(" | "));

  const estadoMalo: PasoConfig[] = [
    { orden: 1, estadoDesde: "BORRADOR", estadoHasta: "PENDIENTE_GERENTE", rolesPermitidos: ["SOLICITANTE"] },
    { orden: 2, estadoDesde: "PENDIENTE_SST", estadoHasta: "ACTIVO", rolesPermitidos: ["SST"] },
  ];
  const r6 = validarWorkflow(estadoMalo, opt);
  ok("detecta estado inexistente en el enum", !r6.valido && r6.errores.some((e) => e.includes("inválido")), r6.errores.join(" | "));

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
