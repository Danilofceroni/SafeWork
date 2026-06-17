/**
 * Error de dominio con código HTTP sugerido.
 * Modela los errores de negocio como excepciones tipadas, naturales en TypeScript.
 */
export class DomainError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "DomainError";
    this.status = status;
  }
}

export const notFound = (msg: string) => new DomainError(msg, 404);
export const forbidden = (msg: string) => new DomainError(msg, 403);
export const badRequest = (msg: string) => new DomainError(msg, 400);
export const unauthorized = (msg: string) => new DomainError(msg, 401);
