import type { Request, Response, NextFunction } from 'express';
import { validateSession } from '../services/auth.service.js';

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.session_token;

  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const session = validateSession(token);

  if (!session) {
    return res.status(401).json({ error: 'Sesión inválida o revocada' });
  }

  req.user = session;
  next();
};