import { Router } from 'express';
import {
  getDashboardSummary,
  getProfile,
  updateProfile,
  getTimeline,
  getMedications,
  addMedication,
  logMedicationStatus,
  addWearableReading,
  getReports,
  getEcgRecords,
  getNotifications,
  markNotificationRead,
} from '../controllers/patientController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// All patient endpoints require patient role
router.use(authenticateJWT, requireRole(['patient', 'admin']));

router.get('/dashboard', getDashboardSummary);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/timeline', getTimeline);

router.get('/medications', getMedications);
router.post('/medications', addMedication);
router.post('/medications/:medicationId/log', logMedicationStatus);

router.post('/wearables', addWearableReading);
router.get('/reports', getReports);
router.get('/ecgs', getEcgRecords);

router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

export default router;

