import type { Request, Response } from 'express';
import type { Role } from '../../generated/prisma/index.js';
import { register, login } from '../services/auth.service.js';

type RegisterBody = { email: string; password: string; name: string; role: Role };

export async function registerHandler(req: Request, res: Response) {
  try {
    const { email, password, name, role } = req.body as RegisterBody;

    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'Todos los campos son requeridos: email, password, name, role' });
      return;
    }

    const user = await register(email, password, name, role);
    res.status(201).json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al registrar usuario';
    res.status(400).json({ error: message });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y password son requeridos' });
      return;
    }

    const result = await login(email, password);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
    res.status(401).json({ error: message });
  }
}
