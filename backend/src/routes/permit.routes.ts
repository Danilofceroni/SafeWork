import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middlewares/auth.js";
import {
  crearPermisoSchema,
  transicionSchema,
  devolverSchema,
  rechazarSchema,
} from "../services/permit.schemas.js";
import {
  crearPermiso,
  obtenerPermiso,
  listarPermisos,
  avanzarPermiso,
  devolverPermiso,
  rechazarPermiso,
  cerrarPermiso,
  suspenderPermiso,
  reactivarPermiso,
} from "../services/permit.service.js";

export const permitRouter: Router = Router();

// Todas las rutas de permisos requieren autenticación.
permitRouter.use(authenticate);

const observacionSchema = z.object({ observacion: z.string().optional() });
const motivoSchema = z.object({ motivo: z.string().min(3) });

// Listado y detalle
permitRouter.get("/", async (req, res) => {
  const filtros = {
    ...(typeof req.query["estado"] === "string" ? { estado: req.query["estado"] } : {}),
    ...(req.query["limit"] ? { limit: Number(req.query["limit"]) } : {}),
    ...(req.query["offset"] ? { offset: Number(req.query["offset"]) } : {}),
  };
  res.json(await listarPermisos(req.user!, filtros));
});

permitRouter.get("/:id", async (req, res) => {
  res.json(await obtenerPermiso(req.params.id, req.user!));
});

// Creación
permitRouter.post("/", async (req, res) => {
  const data = crearPermisoSchema.parse(req.body);
  res.status(201).json(await crearPermiso(data, req.user!));
});

// Transición por el flujo (motor de estados)
permitRouter.post("/:id/avanzar", async (req, res) => {
  const data = transicionSchema.parse(req.body ?? {});
  res.json(await avanzarPermiso(req.params.id, req.user!, data));
});

// Acciones del motor
permitRouter.post("/:id/devolver", async (req, res) => {
  const { motivo } = devolverSchema.parse(req.body);
  res.json(await devolverPermiso(req.params.id, motivo, req.user!));
});

permitRouter.post("/:id/rechazar", async (req, res) => {
  const { motivo } = rechazarSchema.parse(req.body);
  res.json(await rechazarPermiso(req.params.id, motivo, req.user!));
});

permitRouter.post("/:id/cerrar", async (req, res) => {
  const { observacion } = observacionSchema.parse(req.body ?? {});
  res.json(await cerrarPermiso(req.params.id, req.user!, observacion));
});

permitRouter.post("/:id/suspender", async (req, res) => {
  const { motivo } = motivoSchema.parse(req.body);
  res.json(await suspenderPermiso(req.params.id, motivo, req.user!));
});

permitRouter.post("/:id/reactivar", async (req, res) => {
  const { observacion } = observacionSchema.parse(req.body ?? {});
  res.json(await reactivarPermiso(req.params.id, req.user!, observacion));
});
