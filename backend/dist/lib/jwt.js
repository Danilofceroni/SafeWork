/**
 * Emisión y verificación de JWT (access + refresh).
 * El `tenantId` viaja en el token: así cada request queda acotado a su tenant
 * sin necesidad de un header aparte (multi-tenancy desde el claim).
 */
import "dotenv/config";
import jwt from "jsonwebtoken";
const ACCESS_SECRET = process.env.JWT_SECRET;
if (!ACCESS_SECRET)
    throw new Error("JWT_SECRET no está definido en .env");
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? `${ACCESS_SECRET}__refresh`;
const ACCESS_TTL = "1h";
const REFRESH_TTL = "7d";
export function firmarAccessToken(payload) {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}
export function firmarRefreshToken(payload) {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}
function extraerPayload(decoded) {
    if (typeof decoded === "string")
        throw new Error("Token inválido");
    return {
        sub: String(decoded.sub),
        tenantId: String(decoded["tenantId"]),
        roles: Array.isArray(decoded["roles"]) ? decoded["roles"] : [],
        companyId: decoded["companyId"] ?? null,
    };
}
export function verificarAccessToken(token) {
    return extraerPayload(jwt.verify(token, ACCESS_SECRET));
}
export function verificarRefreshToken(token) {
    return extraerPayload(jwt.verify(token, REFRESH_SECRET));
}
//# sourceMappingURL=jwt.js.map