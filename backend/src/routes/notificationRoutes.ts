import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { getUserNotifications, markUserNotificationRead } from '../controllers/notificationController.js';

const router = Router();

router.use(authenticateJWT);
router.get('/', getUserNotifications);
router.put('/:id/read', markUserNotificationRead);

export default router;
