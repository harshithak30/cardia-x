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
import { uploadPrescription } from '../middleware/upload.js';
import { confirmHistoricalPrescription, getHistoricalPrescriptionFile, getHistoricalPrescriptions, retryHistoricalPrescriptionOcr, uploadHistoricalPrescription } from '../controllers/uploadController.js';

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
router.get('/prescriptions', requireRole(['patient']), getHistoricalPrescriptions);
router.get('/prescriptions/:prescriptionId/file', requireRole(['patient']), getHistoricalPrescriptionFile);
router.post('/prescriptions', requireRole(['patient']), uploadPrescription.single('prescriptionFile'), uploadHistoricalPrescription);
router.post('/prescriptions/:prescriptionId/retry-ocr', requireRole(['patient']), retryHistoricalPrescriptionOcr);
router.post('/prescriptions/:prescriptionId/confirm', requireRole(['patient']), confirmHistoricalPrescription);

router.post('/wearables', addWearableReading);
router.get('/reports', getReports);
router.get('/ecgs', getEcgRecords);

router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

export default router;

