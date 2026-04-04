import { Router } from 'express';
import authRoutes from './api/auth/auth.routes';
import chatRoutes from './api/chat/chat.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);

export default router;
