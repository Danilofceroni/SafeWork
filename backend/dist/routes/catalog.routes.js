/**
 * Catálogos de solo lectura para alimentar los formularios del frontend
 * (tipos de permiso, plantas/zonas/ubicaciones, empresas). Acotado al tenant.
 */
import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { prisma } from "../lib/prisma.js";
export const catalogRouter = Router();
catalogRouter.use(authenticate);
catalogRouter.get("/", async (req, res) => {
    const tenantId = req.user.tenantId;
    const [permitTypes, plants, companies] = await Promise.all([
        prisma.permitType.findMany({
            where: { tenantId },
            select: { id: true, nombre: true, prefijo: true, requierePermisoPadre: true, requiereACR: true, cierreManual: true },
            orderBy: { prefijo: "asc" },
        }),
        prisma.plant.findMany({
            where: { tenantId },
            select: {
                id: true,
                nombre: true,
                sigla: true,
                zones: { select: { id: true, nombre: true, locations: { select: { id: true, nombre: true } } } },
            },
            orderBy: { nombre: "asc" },
        }),
        prisma.company.findMany({
            where: { tenantId, activa: true },
            select: { id: true, nombre: true, tipo: true },
            orderBy: { nombre: "asc" },
        }),
    ]);
    res.json({ permitTypes, plants, companies });
});
//# sourceMappingURL=catalog.routes.js.map