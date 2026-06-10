import type { Request, Response } from 'express';
<<<<<<< HEAD
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
=======
import { createSession } from '../services/auth.service.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email === 'admin@proyecto.com' && password === '1234') {
    const userId = 'user_123';
    const role = 'admin';

    const token = createSession(userId, role);

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 día
    });

    return res.status(200).json({ message: 'Login exitoso', role });
  }

  return res.status(401).json({ error: 'Credenciales inválidas' });
};
>>>>>>> 6764b9a (Implementación de login con Opaque Tokens (SOT) y conexión con el prototipo frontend)
