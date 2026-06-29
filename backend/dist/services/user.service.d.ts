import type { Role } from '../../generated/prisma/index.js';
export declare function findAll(): Promise<{
    id: string;
    rut: string;
    nombre: string;
    email: string | null;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function findById(id: string): Promise<{
    id: string;
    rut: string;
    nombre: string;
    email: string | null;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare function create(data: {
    tenantId?: string;
    rut?: string;
    nombre?: string;
    email?: string | null;
    password: string;
    name?: string;
    role?: Role;
}): Promise<{
    id: string;
    rut: string;
    nombre: string;
    email: string | null;
    activo: boolean;
    createdAt: Date;
}>;
export declare function update(id: string, data: Record<string, unknown>): Promise<{
    id: string;
    rut: string;
    nombre: string;
    email: string | null;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function remove(id: string): Promise<void>;
//# sourceMappingURL=user.service.d.ts.map