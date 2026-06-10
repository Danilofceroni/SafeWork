import type { Request, Response, NextFunction } from 'express';
<<<<<<< HEAD
import { verifyToken } from '../services/auth.service.js';
import type { AuthPayload } from '../services/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = header.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
=======
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
>>>>>>> 6764b9a (Implementación de login con Opaque Tokens (SOT) y conexión con el prototipo frontend)
