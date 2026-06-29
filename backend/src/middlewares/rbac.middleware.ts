import type { Request, Response, NextFunction } from 'express';
import type { Role } from '../../generated/prisma/index.js';

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    if (!user.roles.some((role) => allowedRoles.includes(String(role)))) {
      res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
      return;
    }

    next();
  };
}
