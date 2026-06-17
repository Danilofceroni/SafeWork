import type { Request, Response, NextFunction } from 'express';
import { validateSession } from '../services/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string; role: string };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.session_token;

  if (!token) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  const session = validateSession(token);

  if (!session) {
    res.status(401).json({ error: 'Sesión inválida o expirada' });
    return;
  }

  req.user = session;
  next();
}
