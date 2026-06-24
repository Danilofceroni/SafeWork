export function authorize(...allowedRoles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: 'No autenticado' });
            return;
        }
        if (!user.roles.some((role) => allowedRoles.includes(String(role)))) {
            res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
            return;
        }
        next();
    };
}
//# sourceMappingURL=rbac.middleware.js.map