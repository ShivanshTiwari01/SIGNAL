import { Router } from 'express';
import authRoutes from './api/auth/auth.routes';
import chatRoutes from './api/chat/chat.routes';
import subscriptionRoutes from './api/subscription/subscription.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/subs', subscriptionRoutes);

export default router;
