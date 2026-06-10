import type { Request, Response } from 'express';
import { createSession } from '../services/auth.service.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email === 'admin@proyecto.com' && password === '1234') { // Mientras no tnegamos base de datos de usuarios.
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