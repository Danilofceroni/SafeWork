/**
 * Middlewares de autenticación, autorización y manejo de errores.
 */
import type { NextFunction, Request, Response } from "express";
/** Verifica el access token (Bearer) y adjunta el actor a `req.user`. */
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
/** Exige que el usuario tenga al menos uno de los roles indicados (ADMIN siempre pasa). */
export declare function authorize(...roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
/** Manejador de errores central: traduce DomainError y ZodError a respuestas HTTP. */
export declare function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map