/**
 * Cliente Prisma compartido (Prisma 7 con driver adapter para PostgreSQL).
 *
 * Prisma 7 usa driver adapters por defecto: el cliente recibe la conexión vía
 * `@prisma/adapter-pg` en lugar de leer la `url` del schema.
 *
 * Aquí vivirá, más adelante (Fase 1 del plan), la extensión `$extends` que
 * inyecta automáticamente el `tenantId` en cada query (multi-tenancy).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/index.js";
export declare const prisma: PrismaClient<{
    adapter: PrismaPg;
}, never, import("../../generated/prisma/runtime/client.js").DefaultArgs>;
//# sourceMappingURL=prisma.d.ts.map