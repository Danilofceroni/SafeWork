import type { Actor } from "../services/permit.service.js";

// El middleware `authenticate` adjunta el actor autenticado a la request.
declare global {
  namespace Express {
    interface Request {
      user?: Actor;
    }
  }
}

export {};
