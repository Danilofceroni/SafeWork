# SafeWork — Documentación de Arquitectura del Backend

> Documento técnico para presentación académica. Explica **qué** se construyó, **cómo**,
> **por qué** se decidió así y **por qué es la mejor opción dado el contexto**, con
> recomendaciones para agregar valor. Autor: Danilo Ceroni. Fecha: junio 2026.

---

## 1. Resumen ejecutivo

SafeWork es el backend de una plataforma **SaaS multi-tenant** para la gestión de
**Permisos de Trabajo de alto riesgo (PTW)** en la industria. Está pensado como un
**producto vendible a múltiples empresas**, empezando por el rubro pesquero.

La tesis de ingeniería del proyecto es una sola idea: **todo lo que en un sistema a medida
tradicional estaría "quemado" en el código (tipos de permiso, flujo de aprobación, roles,
formularios, plantas) pasa a ser configuración almacenada en base de datos.** Esto convierte
un sistema de un solo cliente en un producto que se adapta a cada empresa sin reprogramar.

La pieza central que lo habilita es un **motor de estados declarativo**: el flujo de
aprobación no vive en sentencias `if/else`, sino en filas de una tabla (`WorkflowStep`) que
cada empresa puede configurar.

---

## 2. Contexto y problema

### 2.1 El dominio
Un **Permiso de Trabajo (PTW)** es la autorización formal y regulada que controla tareas de
alto riesgo (trabajo en caliente, espacios confinados, altura, eléctrico) **antes** de
ejecutarlas. En Chile se conoce también como **PETAR** y es exigible por normativa de
seguridad (Ley 16.744, DS N°44, fiscalización de la Dirección del Trabajo / SUSESO).

El flujo típico: un solicitante pide el trabajo y lo adjudica a una empresa contratista;
ésta completa el permiso; el solicitante revisa; el jefe del área toma precauciones; y
finalmente el prevencionista de riesgos (SST) autoriza. Recién ahí el trabajo queda activo.

### 2.2 El problema de los sistemas a medida
Un sistema de permisos hecho a medida para una sola empresa suele tener **acoplados al
código** los tipos de permiso (G/C/H), las transiciones de estado, los roles, los checklists
y las plantas. Venderlo a otra empresa implicaría **reprogramar**.

### 2.3 El objetivo
Construir un backend que **un cliente nuevo pueda adoptar configurando datos, no escribiendo
código**, manteniendo aislada y segura la información de cada empresa (multi-tenancy).

---

## 3. Stack tecnológico y justificación

| Capa | Tecnología | Por qué (en este contexto) |
|---|---|---|
| Lenguaje | **TypeScript** (ESM, `strict`) | Tipado estático extremo a extremo reduce errores en un dominio crítico de seguridad; el compilador documenta el contrato de datos. |
| Runtime/HTTP | **Node.js + Express 5** | Conocido por el autor, ecosistema maduro; Express 5 captura errores async automáticamente. |
| ORM | **Prisma 7** | Esquema declarativo central (`schema.prisma`), tipos autogenerados, migraciones versionadas. Frente a Sequelize (usado en el original) gana en seguridad de tipos y mantenibilidad. |
| Base de datos | **PostgreSQL** | Relacional robusta; soporta JSON (formularios dinámicos), arreglos, índices compuestos y RLS (aislamiento por tenant a futuro). |
| Conexión | **Driver adapter `@prisma/adapter-pg`** | Prisma 7 usa adaptadores de driver por defecto; desacopla el cliente del motor. |
| Validación | **Zod** | Validación declarativa de la entrada; los esquemas son reutilizables en el frontend (un solo contrato). |
| Auth | **JWT (access + refresh)** | Sin estado, escalable; el `tenantId` viaja en el token. |
| Hashing | **bcrypt** | Estándar de la industria para contraseñas. |
| Fechas | **Luxon** | Manejo correcto de zona horaria por tenant (evita los desfases del sistema original). |

**Por qué este stack es el adecuado al contexto:** es un proyecto de **un desarrollador**
que necesita **velocidad y seguridad**. Prisma + TypeScript + Zod forman una cadena de
tipos que detecta errores en tiempo de compilación en vez de en producción —crítico cuando
el software autoriza trabajo físico de riesgo y no hay un equipo de QA detrás.

---

## 4. Decisiones de arquitectura (el "por qué")

### 4.1 Multi-tenancy: esquema compartido con columna `tenantId`
**Decisión:** todas las tablas de dominio llevan `tenantId`; cada consulta se acota a ese
tenant.
**Por qué:** es el modelo más simple y económico para empezar (una sola base, una sola
migración) y suficiente para decenas de clientes. La alternativa (un esquema/BD por cliente)
se justifica recién con muchos clientes grandes.
**Refuerzo recomendado:** activar **Row-Level Security (RLS)** en PostgreSQL como segunda
barrera: aunque una consulta olvide el `tenantId`, la base lo bloquea. (Ver §10.)

### 4.2 Motor de estados declarativo — la decisión central
**Decisión:** el flujo de aprobación se modela como filas en `Workflow` / `WorkflowStep`
(estado origen, estado destino, roles permitidos, condición de salto). El servicio
`avanzarPermiso()` lee esas filas; **no contiene el flujo fijo en el código**.
**Por qué:** la alternativa habitual es tener el flujo en un mapa de transiciones y una
validación de rol con `if/else`. Cada empresa con un flujo distinto exigiría tocar
código. Con el motor declarativo, **una empresa configura su flujo editando datos**.
**Por qué es la mejor opción dado el contexto:** es precisamente lo que transforma un
proyecto a medida en un **producto SaaS**. Patrón aplicado: **máquina de estados dirigida
por datos (data-driven state machine)**.

```
EXTERNO:  BORRADOR → P_CONTRATISTA → P_SOLICITANTE → P_JEFE_AREA → P_SST → ACTIVO
INTERNO:  BORRADOR ──(salto si empresa interna)──────→ P_JEFE_AREA → P_SST → ACTIVO
```

El "salto interno" (cuando la empresa es propia y no hay contratista) no es un `if` en el
código: es una **condición declarada en el paso** (`condicionSalto: "empresa.tipo==INTERNA"`).

### 4.3 De código fijo a configuración por tenant
**Decisión:** tipos de permiso (`PermitType`), roles (`Role`), formularios (`FormTemplate`,
JSON-schema), plantas/zonas/ubicaciones y workflows son **datos por tenant**.
**Por qué:** habilita el modelo de negocio "pesqueras primero, otros rubros después": pasar
de pesca a minería o construcción es **configurar un tenant**, no programar.

### 4.4 Validador de workflows (la "baranda")
**Decisión:** un módulo (`workflow.validator.ts`) valida que un flujo configurado sea
coherente antes de guardarlo: debe iniciar en BORRADOR, alcanzar ACTIVO (y CERRADO si el
tipo cierra manual), sin estados sin salida, con roles existentes y condiciones soportadas.
**Por qué:** permitir que el cliente configure su flujo es valioso, pero **peligroso** en un
sistema de seguridad (un flujo mal armado podría omitir la firma del prevencionista). El
validador da libertad **con barandas**: el vocabulario de estados es fijo (enum), la
"gramática" (orden, roles, saltos) es configurable y validada. Es el modelo **híbrido**:
plantillas curadas + personalización controlada.

### 4.5 Acciones del motor vs. pasos del workflow
**Decisión:** `devolver`, `rechazar`, `cerrar` (anticipado), `suspender` y `reactivar` son
**acciones** del servicio, no pasos del flujo lineal.
**Por qué:** desde `ACTIVO` ya sale la transición de cierre formal (en trabajo en caliente),
y un estado solo puede tener una transición "hacia adelante". Modelar suspender/reactivar
como acciones evita el choque y refleja la realidad operativa: el prevencionista puede
**suspender** un trabajo activo ante una condición insegura y **reactivarlo** al corregirla
(control of work en tiempo real). `SUSPENDIDO` y `OBSERVADO` se alcanzan por acción, por eso
el validador no les exige paso de salida.

### 4.6 Fechas con zona horaria por tenant (Luxon)
**Decisión:** el cálculo de vencimiento usa el `timezone` del tenant (`America/Santiago`).
**Por qué:** el sistema original tenía parches manuales de zona horaria y desfases. Con
Luxon, la regla de vigencia (días, "hasta fin de mes", "no cruzar el mes") se calcula
correctamente y por tenant. La regla vive en `PermitType`, no en el código.

### 4.7 Auditoría append-only
**Decisión:** cada acción registra una fila inmutable en `AuditLog` (quién, cuándo, estado
anterior/nuevo, observación, IP).
**Por qué:** la trazabilidad **es** el producto en un sistema de cumplimiento: ante una
fiscalización, hay que demostrar quién autorizó qué y cuándo. Patrón cercano a **event log /
event sourcing** acotado.

### 4.8 Errores tipados y validación de entrada
**Decisión:** `DomainError` con código HTTP; Zod valida toda entrada; un middleware central
traduce errores a respuestas JSON.
**Por qué:** reemplaza el patrón `[resultado, error]` del original por excepciones tipadas
(más natural en TS) y centraliza el manejo de errores (principio DRY, separación de
responsabilidades).

### 4.9 Autenticación multi-tenant
**Decisión:** JWT con `tenantId`, `roles` y `companyId` en el claim; `authenticate` arma el
"actor" y `authorize(roles)` controla acceso.
**Por qué:** sin estado y escalable; el tenant viaja en el token, así cada request queda
acotada sin un header aparte. Soporta **multi-rol** (un usuario puede ser, p. ej.,
Solicitante y Jefe de Área).

---

## 5. Modelo de datos (18 entidades)

**SaaS/identidad:** `Tenant`, `User`, `Role`, `UserRole`, `Company`
**Catálogos:** `Plant`, `Zone`, `Location`
**Configuración del dominio:** `PermitType`, `Workflow`, `WorkflowStep`, `FormTemplate`
**Operación:** `Permit` (entidad central), `Approval` (firmas), `Worker`, `CrewSignature`
(cuadrilla), `AuditLog`, `Visit`

```
Tenant 1───* User *───* Role            Tenant 1───* PermitType *──1 Workflow 1───* WorkflowStep
   │                                         │                         
   ├──* Company 1───* Worker                 └──* FormTemplate (M:N PermitType)
   ├──* Plant 1───* Zone 1───* Location
   └──* Permit ──* Approval
              ├──* CrewSignature *──1 Worker
              ├──* AuditLog
              └──1 Permit (padre, p/ caliente vinculado a crítico)
```

Estados del permiso (`PermitStatus`): BORRADOR · PENDIENTE_CONTRATISTA · PENDIENTE_SOLICITANTE
· PENDIENTE_JEFE_AREA · PENDIENTE_SST · ACTIVO · SUSPENDIDO · PENDIENTE_CIERRE_SOLICITANTE ·
PENDIENTE_CIERRE_JEFE_AREA · OBSERVADO · RECHAZADO · CERRADO · VENCIDO.

---

## 6. Flujo de negocio modelado

- **Externo** (con contratista): 5 etapas de aprobación con firma en cada una.
- **Interno** (empresa propia): salta al contratista, sigue por jefe de área y SST.
- **Trabajo en caliente**: se vincula a un permiso crítico padre; cierre manual con firmas
  (3 externo / 2 interno, resuelto por salto declarativo).
- **General/Crítico**: cierre automático al vencer, o **cierre manual anticipado** si el
  trabajo termina antes.
- **Suspensión**: el prevencionista detiene un permiso activo y lo reactiva al corregir.
- **Devolución/Rechazo**: con observaciones; la devolución permite reanudar al estado de
  origen.

---

## 7. Seguridad

- Autenticación JWT (access + refresh); contraseñas con bcrypt.
- Autorización por roles (multi-rol) y validación de pertenencia a empresa/solicitante.
- Aislamiento por tenant en cada consulta.
- Auditoría inmutable de todas las acciones.
- Validación estricta de entrada (Zod) → previene datos corruptos/inyección.

---

## 8. Verificación

El proyecto incluye **scripts de verificación ejecutables** que prueban el comportamiento
real contra la base de datos:

- `verify:engine` — recorre los flujos completos (externo, salto interno, cierre 3/2 firmas,
  suspender/reactivar, devolver/reanudar, rechazar, correlativo de código, cálculo de
  vencimiento, control de acceso por rol). Limpia lo que crea (re-ejecutable).
- `verify:validator` — confirma que los flujos válidos pasan y que 6 configuraciones rotas se
  detectan con el error correcto.
- `smoke:http` — prueba la API por HTTP de punta a punta (login, catálogo, crear, listar,
  detalle, transiciones, suspender/reactivar, cierre, validación 400/403).

Todos pasan. *(Recomendación: migrarlos a pruebas automatizadas formales — ver §10.)*

---

## 9. Decisiones técnicas y su justificación

| Aspecto | Enfoque a medida típico | SafeWork | Beneficio |
|---|---|---|---|
| Alcance | Mono-empresa, fijo en código | Multi-tenant configurable | Vendible a múltiples empresas |
| Flujo | `if/else` en el controlador | Tabla `WorkflowStep` | Configurable sin programar |
| Lenguaje | JavaScript | TypeScript estricto | Menos errores, contrato explícito |
| ORM | Sequelize | Prisma 7 + tipos | Migraciones y tipos seguros |
| Fechas | Parches manuales de TZ | Luxon por tenant | Vencimientos correctos |
| Formularios | Cableados en el frontend | `FormTemplate` (JSON-schema) | Checklists configurables |
| Validación | Joi disperso | Zod compartible | Un contrato front/back |
| Pruebas | No tenía | Scripts de verificación | Comportamiento demostrable |

---

## 10. Recomendaciones de valor (para enmarcar ante el profesor)

Estas adiciones elevan el rigor técnico-académico del proyecto y son buenos puntos para
destacar en la presentación:

1. **Pruebas automatizadas (Vitest + Supertest):** convertir los scripts de verificación en
   una suite con cobertura. Demuestra calidad de ingeniería, no solo "funciona en mi PC".
2. **Migraciones versionadas (`prisma migrate`):** hoy se usa `db push`; pasar a migraciones
   versionadas documenta la evolución del esquema (buena práctica profesional).
3. **Row-Level Security (RLS) en PostgreSQL:** segunda barrera de aislamiento multi-tenant a
   nivel de base de datos. Excelente punto de seguridad para destacar.
4. **Documentación de API (OpenAPI/Swagger):** especificación formal de los endpoints;
   profesional y útil para integraciones.
5. **Diagramas formales (UML/ER y diagrama de estados):** el modelo entidad-relación y el
   diagrama de la máquina de estados en notación estándar comunican el diseño con rigor.
6. **Patrones y principios explícitos:** nombrar en la defensa los patrones aplicados
   —máquina de estados dirigida por datos, estrategia (evaluación de condiciones),
   multi-tenancy de esquema compartido, separación en capas (rutas/servicios/librerías),
   auditoría append-only— y los principios SOLID/DRY que guiaron las decisiones.
7. **Jobs confiables (pg-boss/BullMQ):** el vencimiento automático y las alertas 24/48h deben
   correr con bloqueo para soportar múltiples instancias (escalabilidad real).
8. **Observabilidad (logs estructurados + Sentry):** monitoreo de errores en producción.
9. **CI/CD (GitHub Actions):** lint + pruebas + build en cada push; práctica de la industria.
10. **Trazabilidad normativa:** mapear explícitamente cada función a la norma que satisface
    (Ley 16.744, DS N°44) — convierte el sistema en "evidencia auditable" y conecta la
    ingeniería con el marco legal chileno.
11. **Competencias de trabajadores:** validar que un trabajador no ingrese a un permiso si su
    certificación (altura, espacio confinado) está vencida — diferenciador de alto valor.
12. **Análisis de seguridad:** breve modelo de amenazas (STRIDE) y cómo el diseño las mitiga.

---

## 11. Glosario

- **PTW / PETAR:** Permiso de Trabajo / Permiso Escrito para Trabajo de Alto Riesgo.
- **SST:** Seguridad y Salud en el Trabajo (el prevencionista de riesgos).
- **Multi-tenant:** una sola instalación atiende a varias empresas con datos aislados.
- **Tenant:** cada empresa cliente.
- **Máquina de estados dirigida por datos:** el flujo se define en datos, no en código.
- **DS N°44 / Ley 16.744:** normativa chilena de prevención de riesgos y seguro laboral.
```
