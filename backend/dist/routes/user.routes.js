import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/rbac.middleware.js';
const router = Router();
router.use(authenticate);
router.get('/', authorize('ADMIN'), getAll);
router.get('/:id', authorize('ADMIN'), getById);
router.post('/', authorize('ADMIN'), create);
router.patch('/:id', authorize('ADMIN'), update);
router.delete('/:id', authorize('ADMIN'), remove);
export default router;
//# sourceMappingURL=user.routes.js.map