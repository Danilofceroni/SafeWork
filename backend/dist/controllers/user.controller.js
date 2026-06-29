import * as userService from '../services/user.service.js';
export async function getAll(req, res) {
    try {
        const users = await userService.findAll();
        res.json(users);
    }
    catch {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
}
export async function getById(req, res) {
    try {
        const id = req.params.id;
        const user = await userService.findById(id);
        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        res.json(user);
    }
    catch {
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
}
export async function create(req, res) {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name || !role) {
            res.status(400).json({ error: 'Todos los campos son requeridos: email, password, name, role' });
            return;
        }
        const user = await userService.create({ email, password, name, role: role });
        res.status(201).json(user);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Error al crear usuario';
        res.status(400).json({ error: message });
    }
}
export async function update(req, res) {
    try {
        const id = req.params.id;
        const body = req.body;
        const updateData = {};
        if (body.email !== undefined)
            updateData.email = body.email;
        if (body.password !== undefined)
            updateData.password = body.password;
        if (body.name !== undefined)
            updateData.name = body.name;
        if (body.role !== undefined)
            updateData.role = body.role;
        if (body.isActive !== undefined)
            updateData.isActive = body.isActive;
        const user = await userService.update(id, updateData);
        res.json(user);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Error al actualizar usuario';
        res.status(400).json({ error: message });
    }
}
export async function remove(req, res) {
    try {
        const id = req.params.id;
        await userService.remove(id);
        res.status(204).send();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Error al eliminar usuario';
        res.status(400).json({ error: message });
    }
}
//# sourceMappingURL=user.controller.js.map