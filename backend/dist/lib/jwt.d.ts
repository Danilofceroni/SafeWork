/**
 * Emisión y verificación de JWT (access + refresh).
 * El `tenantId` viaja en el token: así cada request queda acotado a su tenant
 * sin necesidad de un header aparte (multi-tenancy desde el claim).
 */
import "dotenv/config";
/** Datos que viajan dentro del token. */
export interface TokenPayload {
    sub: string;
    tenantId: string;
    roles: string[];
    companyId: string | null;
}
export declare function firmarAccessToken(payload: TokenPayload): string;
export declare function firmarRefreshToken(payload: TokenPayload): string;
export declare function verificarAccessToken(token: string): TokenPayload;
export declare function verificarRefreshToken(token: string): TokenPayload;
//# sourceMappingURL=jwt.d.ts.map