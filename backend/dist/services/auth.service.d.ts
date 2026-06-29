export interface LoginInput {
    tenantSlug: string;
    rut: string;
    password: string;
}
interface PerfilUsuario {
    id: string;
    rut: string;
    nombre: string;
    roles: string[];
    tenantId: string;
    companyId: string | null;
}
export declare function login(input: LoginInput): Promise<{
    accessToken: string;
    refreshToken: string;
    user: PerfilUsuario;
}>;
export declare function refrescarSesion(refreshToken: string): Promise<{
    accessToken: string;
}>;
export declare function obtenerPerfil(userId: string, tenantId: string): Promise<PerfilUsuario>;
export {};
//# sourceMappingURL=auth.service.d.ts.map