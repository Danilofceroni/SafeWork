import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middlewares/auth.js";
import { login, obtenerPerfil, refrescarSesion } from "../services/auth.service.js";
export const authRouter = Router();
const loginSchema = z.object({
    tenantSlug: z.string().min(1),
    rut: z.string().min(1),
    password: z.string().min(1),
});
authRouter.post("/login", async (req, res) => {
    const data = loginSchema.parse(req.body);
    res.json(await login(data));
});
authRouter.post("/refresh", async (req, res) => {
    const { refreshToken } = z.object({ refreshToken: z.string().min(1) }).parse(req.body);
    res.json(await refrescarSesion(refreshToken));
});
authRouter.get("/me", authenticate, async (req, res) => {
    const actor = req.user;
    res.json(await obtenerPerfil(actor.userId, actor.tenantId));
});
//# sourceMappingURL=auth.routes.js.map