import { Router } from 'express';
import {
  getDoctorDashboardSummary,
  getPatientsList,
  getPatientDetails360,
  reviewRecommendation,
  addDoctorNote,
  prescribeMedication,
} from '../controllers/doctorController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT, requireRole(['doctor', 'admin']));

router.get('/dashboard', getDoctorDashboardSummary);
router.get('/patients', getPatientsList);
router.get('/patients/:patientId', getPatientDetails360);
router.post('/recommendations/:type/:id/review', reviewRecommendation);
router.post('/patients/:patientId/notes', addDoctorNote);
router.post('/patients/:patientId/medications', prescribeMedication);

export default router;

