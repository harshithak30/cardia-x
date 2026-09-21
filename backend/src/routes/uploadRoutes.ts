import { Router } from 'express';
import { uploadReport } from '../controllers/uploadController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/report', authenticateJWT, requireRole(['patient', 'admin']), upload.single('reportFile'), uploadReport);

export default router;

