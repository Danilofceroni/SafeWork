/**
 * Seed de SafeWork — Tenant demo "Camanchaca".
 *
 * Crea la configuración base del sistema:
 * roles, empresas (interna/externa), plantas/zonas/ubicaciones, plantillas de
 * formulario (ACR, permiso caliente, checklist jefe), workflows con sus pasos
 * (motor de estados declarativo) y los tipos de permiso G / C / H.
 *
 * Es idempotente: se puede correr varias veces (usa upserts).
 * Ejecutar:  pnpm db:seed
 */
import { CompanyType } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

const DEMO_PASSWORD = "safework123";

async function main() {
  console.log("🌱 Seed SafeWork — tenant Camanchaca");

  // ----------------------------------------------------------------
  // 1. Tenant
  // ----------------------------------------------------------------
  const tenant = await prisma.tenant.upsert({
    where: { slug: "camanchaca" },
    update: {},
    create: {
      nombre: "Camanchaca Pesca Sur S.A.",
      slug: "camanchaca",
      timezone: "America/Santiago",
      plan: "professional",
    },
  });
  const tenantId = tenant.id;
  console.log(`  ✓ Tenant: ${tenant.nombre} (${tenantId})`);

  // ----------------------------------------------------------------
  // 2. Roles
  // ----------------------------------------------------------------
  const rolesData: [string, string][] = [
    ["ADMIN", "Administrador"],
    ["SST", "Prevencionista de Riesgos (SST)"],
    ["JEFE_AREA", "Jefe de Área"],
    ["SOLICITANTE", "Solicitante / Supervisor"],
    ["CONTRATISTA", "Empresa Contratista"],
    ["PORTERIA", "Portería / Control de Acceso"],
    ["FLOTA", "Control de Flota"],
  ];
  const roleIds: Record<string, string> = {};
  for (const [codigo, nombre] of rolesData) {
    const r = await prisma.role.upsert({
      where: { tenantId_codigo: { tenantId, codigo } },
      update: { nombre },
      create: { tenantId, codigo, nombre },
    });
    roleIds[codigo] = r.id;
  }
  const reqRole = (codigo: string): string => {
    const id = roleIds[codigo];
    if (!id) throw new Error(`Rol no sembrado: ${codigo}`);
    return id;
  };
  console.log(`  ✓ Roles: ${rolesData.length}`);

  // ----------------------------------------------------------------
  // 3. Empresas (interna dispara el salto de flujo, RN-10)
  // ----------------------------------------------------------------
  const empresaInterna = await prisma.company.upsert({
    where: { tenantId_rut: { tenantId, rut: "91.000.000-0" } },
    update: {},
    create: {
      tenantId,
      nombre: "Camanchaca (interna)",
      rut: "91.000.000-0",
      tipo: CompanyType.INTERNA,
    },
  });
  const empresaExterna = await prisma.company.upsert({
    where: { tenantId_rut: { tenantId, rut: "76.123.456-7" } },
    update: {},
    create: {
      tenantId,
      nombre: "Montajes Industriales SpA",
      rut: "76.123.456-7",
      tipo: CompanyType.EXTERNA,
    },
  });
  console.log("  ✓ Empresas: interna + externa");

  // ----------------------------------------------------------------
  // 4. Planta → Zonas → Ubicaciones
  // ----------------------------------------------------------------
  const planta = await prisma.plant.upsert({
    where: { tenantId_sigla: { tenantId, sigla: "CS" } },
    update: { nombre: "Coronel Sur" },
    create: { tenantId, nombre: "Coronel Sur", sigla: "CS" },
  });

  const estructuraZonas: Record<string, string[]> = {
    "Planta Harina": ["Secador", "Molienda", "Ensacado"],
    "Sala Eléctrica": ["Tablero Principal", "Sala de Bombas"],
    "Muelle": ["Muelle de Descarga", "Pozo de Descarga"],
  };
  const zonaNombres = Object.keys(estructuraZonas);
  for (const zonaNombre of zonaNombres) {
    const zona = await prisma.zone.upsert({
      where: { plantId_nombre: { plantId: planta.id, nombre: zonaNombre } },
      update: {},
      create: { tenantId, plantId: planta.id, nombre: zonaNombre },
    });
    const ubicaciones = estructuraZonas[zonaNombre] ?? [];
    for (const ubic of ubicaciones) {
      await prisma.location.upsert({
        where: { zoneId_nombre: { zoneId: zona.id, nombre: ubic } },
        update: {},
        create: { tenantId, zoneId: zona.id, nombre: ubic },
      });
    }
  }
  console.log(`  ✓ Planta CS con ${zonaNombres.length} zonas y sus ubicaciones`);

  // ----------------------------------------------------------------
  // 5. Plantillas de formulario (formularios dinámicos)
  // ----------------------------------------------------------------
  const formACR = await prisma.formTemplate.upsert({
    where: { tenantId_codigo: { tenantId, codigo: "ACR" } },
    update: {},
    create: {
      tenantId,
      codigo: "ACR",
      nombre: "Análisis de Control de Riesgos",
      schema: {
        secciones: [
          {
            titulo: "Identificación de peligros",
            campos: [
              { key: "peligros", label: "Peligros identificados", type: "textarea", required: true },
              { key: "medidas", label: "Medidas de control", type: "textarea", required: true },
            ],
          },
          {
            titulo: "EPP requerido",
            campos: [
              { key: "epp", label: "Elementos de protección", type: "checklist",
                options: ["Casco", "Guantes", "Lentes", "Arnés", "Protección auditiva"] },
            ],
          },
        ],
      },
    },
  });
  const formCaliente = await prisma.formTemplate.upsert({
    where: { tenantId_codigo: { tenantId, codigo: "PERMISO_CALIENTE" } },
    update: {},
    create: {
      tenantId,
      codigo: "PERMISO_CALIENTE",
      nombre: "Checklist Trabajo en Caliente",
      schema: {
        secciones: [
          {
            titulo: "Condiciones del área",
            campos: [
              { key: "extintor", label: "Extintor disponible y operativo", type: "boolean", required: true },
              { key: "combustibles_retirados", label: "Materiales combustibles retirados", type: "boolean", required: true },
              { key: "vigia_fuego", label: "Vigía de fuego asignado", type: "boolean", required: true },
              { key: "observaciones", label: "Observaciones", type: "textarea" },
            ],
          },
        ],
      },
    },
  });
  const formChecklistJefe = await prisma.formTemplate.upsert({
    where: { tenantId_codigo: { tenantId, codigo: "CHECKLIST_JEFE" } },
    update: {},
    create: {
      tenantId,
      codigo: "CHECKLIST_JEFE",
      nombre: "Verificación Jefe de Área",
      schema: {
        secciones: [
          {
            titulo: "Verificación previa a la autorización",
            campos: [
              { key: "area_disponible", label: "Área disponible para el trabajo", type: "boolean", required: true },
              { key: "bloqueos", label: "Bloqueos/aislaciones realizados", type: "boolean", required: true },
              { key: "comentario", label: "Comentario", type: "textarea" },
            ],
          },
        ],
      },
    },
  });
  console.log("  ✓ Plantillas de formulario: ACR, Caliente, Checklist Jefe");

  // ----------------------------------------------------------------
  // 6. Workflows + pasos (motor de estados declarativo)
  // ----------------------------------------------------------------
  type StepSeed = {
    orden: number;
    estadoDesde: string;
    estadoHasta: string;
    rolesPermitidos: string[];
    condicionSalto?: string;
    estadoHastaSalto?: string;
  };

  async function upsertWorkflow(nombre: string, steps: StepSeed[]): Promise<string> {
    const wf = await prisma.workflow.upsert({
      where: { tenantId_nombre: { tenantId, nombre } },
      update: {},
      create: { tenantId, nombre },
    });
    for (const s of steps) {
      await prisma.workflowStep.upsert({
        where: { workflowId_estadoDesde: { workflowId: wf.id, estadoDesde: s.estadoDesde } },
        update: {
          orden: s.orden,
          estadoHasta: s.estadoHasta,
          rolesPermitidos: s.rolesPermitidos,
          condicionSalto: s.condicionSalto ?? null,
          estadoHastaSalto: s.estadoHastaSalto ?? null,
        },
        create: {
          workflowId: wf.id,
          orden: s.orden,
          estadoDesde: s.estadoDesde,
          estadoHasta: s.estadoHasta,
          rolesPermitidos: s.rolesPermitidos,
          condicionSalto: s.condicionSalto ?? null,
          estadoHastaSalto: s.estadoHastaSalto ?? null,
        },
      });
    }
    return wf.id;
  }

  // Pasos comunes de aprobación (intake). El salto interno se declara en el paso
  // inicial: si la empresa es INTERNA, el solicitante (que rellena lo del contratista)
  // se salta SOLO al contratista y pasa directo al jefe de área → SST → ACTIVO.
  const pasosIntake: StepSeed[] = [
    {
      orden: 1, estadoDesde: "BORRADOR", estadoHasta: "PENDIENTE_CONTRATISTA",
      rolesPermitidos: ["SOLICITANTE", "ADMIN"],
      condicionSalto: "empresa.tipo==INTERNA", estadoHastaSalto: "PENDIENTE_JEFE_AREA",
    },
    { orden: 2, estadoDesde: "PENDIENTE_CONTRATISTA", estadoHasta: "PENDIENTE_SOLICITANTE", rolesPermitidos: ["CONTRATISTA", "SOLICITANTE", "ADMIN"] },
    { orden: 3, estadoDesde: "PENDIENTE_SOLICITANTE", estadoHasta: "PENDIENTE_JEFE_AREA", rolesPermitidos: ["SOLICITANTE", "ADMIN"] },
    { orden: 4, estadoDesde: "PENDIENTE_JEFE_AREA", estadoHasta: "PENDIENTE_SST", rolesPermitidos: ["JEFE_AREA", "ADMIN"] },
    { orden: 5, estadoDesde: "PENDIENTE_SST", estadoHasta: "ACTIVO", rolesPermitidos: ["SST", "ADMIN"] },
  ];

  // Workflow estándar (General / Crítico): el cierre lo hace el job por vencimiento (RN-08).
  const workflowEstandarId = await upsertWorkflow("Estándar (General/Crítico)", pasosIntake);

  // Workflow caliente (En Caliente): añade cierre manual (RN-04).
  // Externo = 3 firmas (Contratista → Solicitante → Jefe); Interno = 2 firmas
  // (Solicitante → Jefe), resuelto con el salto declarativo en el paso 7.
  const pasosCierre: StepSeed[] = [
    { orden: 6, estadoDesde: "ACTIVO", estadoHasta: "PENDIENTE_CIERRE_SOLICITANTE", rolesPermitidos: ["CONTRATISTA", "SOLICITANTE", "ADMIN"] },
    {
      orden: 7, estadoDesde: "PENDIENTE_CIERRE_SOLICITANTE", estadoHasta: "PENDIENTE_CIERRE_JEFE_AREA",
      rolesPermitidos: ["SOLICITANTE", "JEFE_AREA", "ADMIN"],
      condicionSalto: "empresa.tipo==INTERNA", estadoHastaSalto: "CERRADO",
    },
    { orden: 8, estadoDesde: "PENDIENTE_CIERRE_JEFE_AREA", estadoHasta: "CERRADO", rolesPermitidos: ["JEFE_AREA", "ADMIN"] },
  ];
  const workflowCalienteId = await upsertWorkflow("Caliente (cierre manual)", [...pasosIntake, ...pasosCierre]);
  console.log("  ✓ Workflows: Estándar + Caliente (con pasos)");

  // ----------------------------------------------------------------
  // 7. Tipos de permiso (G / C / H)
  // ----------------------------------------------------------------
  await prisma.permitType.upsert({
    where: { tenantId_prefijo: { tenantId, prefijo: "G" } },
    update: { workflowId: workflowEstandarId },
    create: {
      tenantId, nombre: "General", prefijo: "G",
      vigenciaDias: 30, vigenciaHastaFinDeMes: true,
      workflowId: workflowEstandarId,
    },
  });
  await prisma.permitType.upsert({
    where: { tenantId_prefijo: { tenantId, prefijo: "C" } },
    update: { workflowId: workflowEstandarId, formTemplates: { connect: [{ id: formACR.id }, { id: formChecklistJefe.id }] } },
    create: {
      tenantId, nombre: "Crítico", prefijo: "C",
      vigenciaDias: 30, vigenciaHastaFinDeMes: true, requiereACR: true,
      workflowId: workflowEstandarId,
      formTemplates: { connect: [{ id: formACR.id }, { id: formChecklistJefe.id }] },
    },
  });
  await prisma.permitType.upsert({
    where: { tenantId_prefijo: { tenantId, prefijo: "H" } },
    update: { workflowId: workflowCalienteId, formTemplates: { connect: [{ id: formCaliente.id }, { id: formChecklistJefe.id }] } },
    create: {
      tenantId, nombre: "En Caliente", prefijo: "H",
      vigenciaDias: 1, requierePermisoPadre: true, cierreManual: true,
      workflowId: workflowCalienteId,
      formTemplates: { connect: [{ id: formCaliente.id }, { id: formChecklistJefe.id }] },
    },
  });
  console.log("  ✓ Tipos de permiso: General, Crítico, En Caliente");

  // ----------------------------------------------------------------
  // 8. Usuarios (clave demo: safework123)
  // ----------------------------------------------------------------
  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  type UserSeed = {
    rut: string; nombre: string; email: string; roles: string[];
    companyId?: string; zonasAsignadas?: string[];
  };
  const usuarios: UserSeed[] = [
    { rut: "11.111.111-1", nombre: "Admin SafeWork", email: "admin@camanchaca.cl", roles: ["ADMIN"] },
    { rut: "22.222.222-2", nombre: "Patricia Soto (SST)", email: "sst@camanchaca.cl", roles: ["SST"] },
    { rut: "33.333.333-3", nombre: "Jorge Ramírez (Jefe Área)", email: "jefe@camanchaca.cl", roles: ["JEFE_AREA"], zonasAsignadas: zonaNombres },
    { rut: "44.444.444-4", nombre: "Luis Pérez (Solicitante)", email: "solicitante@camanchaca.cl", roles: ["SOLICITANTE"], companyId: empresaInterna.id },
    { rut: "55.555.555-5", nombre: "Marco Díaz (Contratista)", email: "contratista@montajes.cl", roles: ["CONTRATISTA"], companyId: empresaExterna.id },
    { rut: "66.666.666-6", nombre: "Rosa Núñez (Portería)", email: "porteria@camanchaca.cl", roles: ["PORTERIA"] },
  ];

  for (const u of usuarios) {
    const user = await prisma.user.upsert({
      where: { tenantId_rut: { tenantId, rut: u.rut } },
      update: {
        nombre: u.nombre,
        email: u.email,
        zonasAsignadas: u.zonasAsignadas ?? [],
        ...(u.companyId ? { companyId: u.companyId } : {}),
      },
      create: {
        tenantId,
        rut: u.rut,
        nombre: u.nombre,
        email: u.email,
        passwordHash,
        zonasAsignadas: u.zonasAsignadas ?? [],
        ...(u.companyId ? { companyId: u.companyId } : {}),
      },
    });
    for (const codigo of u.roles) {
      const roleId = reqRole(codigo);
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId } },
        update: {},
        create: { userId: user.id, roleId },
      });
    }
  }
  console.log(`  ✓ Usuarios: ${usuarios.length} (clave demo: ${DEMO_PASSWORD})`);

  // ----------------------------------------------------------------
  // 9. Trabajadores de la empresa externa (cuadrilla de ejemplo)
  // ----------------------------------------------------------------
  const trabajadores: [string, string, string][] = [
    ["12.345.678-9", "Pedro Gómez", "Soldador"],
    ["98.765.432-1", "Ana Torres", "Ayudante"],
  ];
  for (const [rut, nombre, cargo] of trabajadores) {
    await prisma.worker.upsert({
      where: { tenantId_rut: { tenantId, rut } },
      update: { nombre, cargo },
      create: { tenantId, rut, nombre, cargo, companyId: empresaExterna.id },
    });
  }
  console.log(`  ✓ Trabajadores: ${trabajadores.length}`);

  console.log("✅ Seed completado.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error en el seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
