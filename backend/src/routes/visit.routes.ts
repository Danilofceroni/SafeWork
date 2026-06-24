import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middlewares/auth.js";
import {
  crearVisita,
  listarVisitas,
  obtenerVisita,
  autorizarVisita,
  rechazarVisita,
  registrarIngreso,
  registrarSalida,
} from "../services/visit.service.js";

export const visitRouter: Router = Router();
visitRouter.use(authenticate);

const crearVisitaSchema = z.object({
  visitanteNombre: z.string().min(2),
  visitanteRut: z.string().min(3),
  visitanteEmpresa: z.string().optional(),
  personaVisitada: z.string().min(2),
  motivo: z.string().min(3),
  area: z.enum(["TIERRA", "FLOTA"]),
  locationId: z.string().cuid(),
  fechaVisita: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Formato esperado: YYYY-MM-DD"),
});

visitRouter.get("/", async (req, res) => {
  const estado = typeof req.query["estado"] === "string" ? req.query["estado"] : undefined;
  res.json(await listarVisitas(req.user!, { ...(estado ? { estado } : {}) }));
});

visitRouter.get("/:id", async (req, res) => {
  res.json(await obtenerVisita(req.params.id, req.user!));
});

visitRouter.post("/", async (req, res) => {
  const data = crearVisitaSchema.parse(req.body);
  res.status(201).json(await crearVisita(data, req.user!));
});

visitRouter.post("/:id/autorizar", async (req, res) => {
  res.json(await autorizarVisita(req.params.id, req.user!));
});

visitRouter.post("/:id/rechazar", async (req, res) => {
  res.json(await rechazarVisita(req.params.id, req.user!));
});

visitRouter.post("/:id/ingreso", async (req, res) => {
  res.json(await registrarIngreso(req.params.id, req.user!));
});

visitRouter.post("/:id/salida", async (req, res) => {
  res.json(await registrarSalida(req.params.id, req.user!));
});
