import type { Request, Response } from 'express';
import type { Role } from '../../generated/prisma/index.js';
import * as userService from '../services/user.service.js';

export async function getAll(req: Request, res: Response) {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const user = await userService.findById(id);

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
}

type CreateBody = { email: string; password: string; name: string; role: string };

export async function create(req: Request, res: Response) {
  try {
    const { email, password, name, role } = req.body as CreateBody;

    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'Todos los campos son requeridos: email, password, name, role' });
      return;
    }

    const user = await userService.create({ email, password, name, role: role as unknown as Role });
    res.status(201).json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear usuario';
    res.status(400).json({ error: message });
  }
}

type UpdateBody = { email?: string; password?: string; name?: string; role?: string; isActive?: boolean };

export async function update(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const body = req.body as UpdateBody;

    const updateData: Record<string, unknown> = {};
    if (body.email !== undefined) updateData.email = body.email;
    if (body.password !== undefined) updateData.password = body.password;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const user = await userService.update(id, updateData);
    res.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar usuario';
    res.status(400).json({ error: message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await userService.remove(id);
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar usuario';
    res.status(400).json({ error: message });
  }
}
