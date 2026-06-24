/**
 * Middlewares de autenticación, autorización y manejo de errores.
 */
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { DomainError } from "../lib/errors.js";
import { verificarAccessToken } from "../lib/jwt.js";

/** Verifica el access token (Bearer) y adjunta el actor a `req.user`. */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Falta el token de autenticación" });
    return;
  }
  try {
    const payload = verificarAccessToken(header.slice("Bearer ".length).trim());
    req.user = {
      tenantId: payload.tenantId,
      userId: payload.sub,
      roles: payload.roles,
      companyId: payload.companyId,
    };
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

/** Exige que el usuario tenga al menos uno de los roles indicados (ADMIN siempre pasa). */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }
    if (user.roles.includes("ADMIN") || user.roles.some((r) => roles.includes(r))) {
      next();
      return;
    }
    res.status(403).json({ error: "No tiene permisos para esta acción" });
  };
}

/** Manejador de errores central: traduce DomainError y ZodError a respuestas HTTP. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof DomainError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Datos inválidos", detalles: err.issues });
    return;
  }
  console.error("[ERROR no controlado]", err);
  res.status(500).json({ error: "Error interno del servidor" });
}