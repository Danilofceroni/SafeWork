
# Benchmark competitivo — SST / Permisos de Trabajo (jun 2026)

> Objetivo: decidir con datos el posicionamiento de SafeWork frente a la competencia
> SST/EHS (chilena e internacional), tras descubrir competidores directos.

## 1. Método y alcance
Relevamiento de tres grupos: (a) SaaS SST chilenos enfocados en cumplimiento DS N°44,
(b) suites EHS internacionales, (c) software especializado en *Permit to Work / Control of
Work*. Fuentes al final.

## 2. Panorama de actores

### Suites SG-SST chilenas (cumplimiento DS N°44) — mercado CROWDED
| Producto | Qué es | PTW (permiso de trabajo) | Target |
|---|---|---|---|
| **safeworksst.cl** | Suite SST 22 módulos, DS44, Ley Karin, indicadores | No tiene módulo PTW dedicado | PyME→500+ trab. ($59k–$349k CLP/mes) |
| **ZYGHT** | Plataforma HSE grande (~25 módulos), ISO 45001 | "Permisos de trabajo seguro" como **1 módulo más** (poco profundo) | Gran empresa: minería, oil&gas, puertos/pesca |
| **Verifty** | Gestión SST + contratistas DS44 | Foco en acreditación de contratistas, no PTW profundo | Minería, construcción, industria |
| **HSETools / hse.software** | IPER y riesgos DS44 | No destacado | Empresas medianas |
| **PreveSafe, Foco Prevención** | Servicios + plataforma | Foco PRL/firma DT, no PTW profundo | Pyme |

### Suites EHS internacionales — amplias, no localizadas a Chile
SafetyCulture (mobile inspections — *explícitamente "carece de profundidad en permit-to-work"*),
Cority, Intelex, EcoOnline, VelocityEHS, Sphera, Evotix, Benchmark Gensuite.

### Especialistas en Permit to Work / Control of Work — el nicho profundo (internacional)
DNV Synergi Life, Benchmark Gensuite (Control of Work), Cority (electronic PTW),
Evotix, Safetymint, VelocityEHS, ComplianceQuest. Características típicas: tipos de permiso
configurables (caliente, espacio confinado, eléctrico), precalificación/competencias de
contratistas, móvil, tiempo real. **Pero**: enterprise, en inglés, foco oil&gas, caros, no
localizados (sin PETAR, RUT, carta de fuego, ACHS/SUSESO).

## 3. Mapa de posicionamiento

```
                      SUITE AMPLIA SG-SST
                              ▲
   SafetyCulture, Cority,     │   safeworksst, ZYGHT,
   Intelex, EcoOnline,        │   Verifty, HSETools
   VelocityEHS                │   (CROWDED + maduro)
                              │
  INTERNACIONAL ◄─────────────┼─────────────► CHILE / PETAR-localizado
   /genérico                  │
                              │
   DNV Synergi, Benchmark     │   ←——  HUECO  ——→
   Gensuite, Evotix,          │   ★ SafeWork (PTW especialista,
   Cority PTW, Safetymint     │     localizado, mid-market)
   (enterprise, inglés, caro) │     CASI VACÍO
                              ▼
                    ESPECIALISTA EN PERMISOS DE TRABAJO
```

## 4. El hueco (la cuña)
**No existe un especialista profundo en Permisos de Trabajo de alto riesgo, localizado a
Chile (PETAR, RUT, carta de fuego, contratistas, ACHS/SUSESO), a precio mid-market**, para
industrias intensivas en contratistas (pesca → minería → construcción).
- Las suites chilenas (safeworksst, ZYGHT) tratan PTW como un módulo superficial dentro de
  una oferta amplia.
- Los especialistas PTW serios son internacionales, caros y no localizados.
- Justo ese cruce —PTW profundo + Chile— es el espacio que SafeWork apunta a ocupar.

## 5. Mapa de features

### Table stakes (todos los tienen — hay que igualar)
Móvil, tipos de permiso configurables (caliente/confinado/eléctrico), firma digital,
audit log, dashboard, multi-sucursal, gestión básica de contratistas.

### Diferenciadores de SafeWork (dónde ganar)
- **Motor de flujo configurable por tenant** (el `WorkflowStep`): la mayoría de los PTW
  traen flujos semi-rígidos. Adaptarse al flujo de cada empresa sin código es vendible.
- **Cuadrilla con competencias/certificaciones** con bloqueo: "el trabajador no entra al
  permiso si su curso de altura está vencido" (engancha con el ángulo capacitación/SENCE).
- **Localización profunda**: PETAR, RUT, carta de fuego, área TIERRA/FLOTA, prevencionista.
- **Permisos padre-hijo** (caliente vinculado a crítico) — sofisticación real.
- **Suspender/reactivar en tiempo real** por el prevencionista (control of work).
- **QR en terreno + portería**, offline, evidencia foto con GPS.
- **Precio mid-market** (vs enterprise internacional).

### Lo que NO perseguir (evitar competir de frente)
IPER completo, Ley Karin, vigilancia de salud, e-learning, indicadores Ley 16.744,
CPHS… ahí las suites ya son maduras. Coexistir/integrar, no replicar.

## 6. Recomendación
1. **Posicionar como especialista en Permisos de Trabajo**, no como suite SST.
2. **Cambiar el nombre** (SafeWork choca con consultora homónima y con competidor SaaS
   safeworksst, mismo rubro y país).
3. **Coexistencia, no reemplazo**: un cliente puede tener ZYGHT/safeworksst para
   cumplimiento amplio y SafeWork para el PTW profundo (o integrarse).
4. Mantener la arquitectura configurable: habilita pesca → minería → construcción sin código.

## 7. Fuentes
- safeworksst.cl · zyght.com · verifty.com · hse.software · comparasoftware.cl (top SG-SST)
- Permit to Work: DNV Synergi, Benchmark Gensuite, Cority, Evotix, VelocityEHS, Safetymint
- EHS: EcoOnline (best EHS 2026), SafetyCulture, Intelex
