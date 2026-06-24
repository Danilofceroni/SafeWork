/**
 * Error de dominio con código HTTP sugerido.
 * Modela los errores de negocio como excepciones tipadas, naturales en TypeScript.
 */
export declare class DomainError extends Error {
    readonly status: number;
    constructor(message: string, status?: number);
}
export declare const notFound: (msg: string) => DomainError;
export declare const forbidden: (msg: string) => DomainError;
export declare const badRequest: (msg: string) => DomainError;
export declare const unauthorized: (msg: string) => DomainError;
//# sourceMappingURL=errors.d.ts.map