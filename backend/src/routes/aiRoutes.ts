import { Router } from 'express';
import {
  handleSymptomChat,
  handleEvidenceChat,
  getChatHistory,
  analyzeManualEcg,
} from '../controllers/aiController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.post('/symptoms/chat', handleSymptomChat);
router.post('/evidence/chat', handleEvidenceChat);
router.get('/chat/history', getChatHistory);
router.post('/ecg/analyze', analyzeManualEcg);

export default router;

