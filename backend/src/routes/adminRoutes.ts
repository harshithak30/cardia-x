import { Router } from 'express';
import {
  getAdminStats,
  getDoctorsList,
  getPatientsList,
  assignPatientToDoctor,
  updateDoctorVerification,
  getGuidelines,
  addGuideline,
} from '../controllers/adminController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/guidelines/public', getGuidelines);

router.use(authenticateJWT, requireRole(['admin']));

router.get('/stats', getAdminStats);
router.get('/doctors', getDoctorsList);
router.get('/patients', getPatientsList);
router.put('/doctors/:doctorProfileId/verify', updateDoctorVerification);
router.put('/doctors/:doctorProfileId/assign-patient', assignPatientToDoctor);
router.get('/guidelines', getGuidelines);
router.post('/guidelines', addGuideline);

export default router;

