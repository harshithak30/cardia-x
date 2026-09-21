import { Router } from 'express';
import { registerPatient, registerDoctor, login, getCurrentUser } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.post('/patient/signup', registerPatient);
router.post('/doctor/signup', registerDoctor);
router.post('/login', login);
router.get('/me', authenticateJWT, getCurrentUser);

export default router;

