import type { Request, Response } from "express";
import * as userService from "../services/user.service.js";

export async function getAll(_req: Request, res: Response) {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const user = await userService.findById(req.params.id as string);
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { tenantId, rut, nombre, email, password, roleCodigo } = req.body;
    if (!tenantId || !rut || !nombre || !password || !roleCodigo) {
      res.status(400).json({ error: "Campos requeridos: tenantId, rut, nombre, password, roleCodigo" });
      return;
    }
    const user = await userService.create({ tenantId, rut, nombre, email, password, roleCodigo });
    res.status(201).json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear usuario";
    res.status(400).json({ error: message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const user = await userService.update(req.params.id as string, req.body);
    res.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar usuario";
    res.status(400).json({ error: message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await userService.remove(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar usuario";
    res.status(400).json({ error: message });
  }
}
