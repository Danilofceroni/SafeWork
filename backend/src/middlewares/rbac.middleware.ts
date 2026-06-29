import type { Request, Response, NextFunction } from "express";

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    if (user.roles.includes("ADMIN") || allowedRoles.some((r) => user.roles.includes(r))) {
      next();
      return;
    }

    res.status(403).json({ error: "No tienes permiso para realizar esta acción" });
  };
}
