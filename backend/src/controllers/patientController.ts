import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.js';
import { PatientProfile } from '../models/PatientProfile.js';
import { WearableMetric } from '../models/WearableMetric.js';
import { ECGRecord } from '../models/ECGRecord.js';
import { MedicalReport } from '../models/MedicalReport.js';
import { Medication } from '../models/Medication.js';
import { Symptom } from '../models/Symptom.js';
import { Investigation } from '../models/Investigation.js';
import { RiskAssessment } from '../models/RiskAssessment.js';
import { PatientWorldModel } from '../models/PatientWorldModel.js';
import { Notification } from '../models/Notification.js';
import { DoctorNote } from '../models/DoctorNote.js';
import { careOrchestratorInstance } from '../agents/CareOrchestrator.js';
import { medicationAgentInstance } from '../agents/MedicationAgent.js';

export const getDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user!.userId);

    const [
      profile,
      latestVitals,
      recentVitalsHistory,
      latestEcgRecord,
      medications,
      upcomingInvestigations,
      recentReports,
      latestRisk,
      worldModel,
      notifications,
    ] = await Promise.all([
      PatientProfile.findOne({ userId: patientId }).populate('assignedDoctorId', 'fullName email phone'),
      WearableMetric.findOne({ patientId }).sort({ timestamp: -1 }),
      WearableMetric.find({ patientId }).sort({ timestamp: -1 }).limit(14),
      ECGRecord.findOne({ patientId }).sort({ recordDate: -1, createdAt: -1 }),
      Medication.find({ patientId, isActive: true }),
      Investigation.find({ patientId, status: { $in: ['recommended_by_ai', 'ordered_by_doctor', 'scheduled'] } }).sort({ priority: 1 }),
      MedicalReport.find({ patientId }).sort({ reportDate: -1 }).limit(5),
      RiskAssessment.findOne({ patientId }).sort({ assessmentDate: -1 }),
      PatientWorldModel.findOne({ patientId }),
      Notification.find({ recipientUserId: patientId, isRead: false }).sort({ createdAt: -1 }).limit(5),
    ]);

    // Calculate total adherence
    const allLogs = medications.flatMap((m) => m.logs || []);
    const overallAdherence = medicationAgentInstance.calculateAdherence(allLogs);
    const linkedEcgReport = latestEcgRecord?.reportId ? await MedicalReport.findById(latestEcgRecord.reportId) : null;
    const latestEcg = latestEcgRecord
      ? (() => {
          const ecg = latestEcgRecord.toObject() as any;
          const linkedReport = linkedEcgReport;
          const extractedFindings = linkedReport?.extractedData?.ecgFindings?.abnormalitiesDetected || [];
          if ((!ecg.abnormalities || ecg.abnormalities.length === 0) && extractedFindings.length > 0) {
            ecg.abnormalities = extractedFindings;
          }
          if (ecg.measurementsAvailable == null) {
            ecg.measurementsAvailable = Boolean(
              linkedReport?.extractedData?.ecgFindings?.measurementsAvailable
            );
          }
          return ecg;
        })()
      : null;
    const hasClinicalData = Boolean(
      latestVitals || latestEcg || medications.length || upcomingInvestigations.length || recentReports.length || latestRisk
    );

    res.json({
      success: true,
      dashboard: {
        profile,
        vitals: {
          latest: latestVitals,
          history: recentVitalsHistory.reverse(),
        },
        ecg: latestEcg,
        medications,
        adherencePercentage: medications.length ? overallAdherence : null,
        investigations: upcomingInvestigations,
        recentReports,
        risk: latestRisk,
        worldModelOverview: {
          narrative: hasClinicalData ? worldModel?.currentTrends?.aiClinicalNarrative : undefined,
          trends: hasClinicalData ? worldModel?.currentTrends || {} : {},
          totalEvents: worldModel?.totalEventsCount || 0,
        },
        hasClinicalData,
        notifications,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user!.userId }).populate('userId', 'fullName email phone');
    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }
    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user!.userId);
    const updates = req.body;

    const profile = await PatientProfile.findOneAndUpdate({ userId: patientId }, { $set: updates }, { new: true });
    
    // Log timeline event
    await careOrchestratorInstance.updatePatientWorldModel(
      patientId,
      'PROFILE_UPDATED',
      'Patient Profile Updated',
      'Medical history or lifestyle parameters were modified by patient.',
      'Doctor',
      'normal'
    );

    res.json({ success: true, message: 'Profile updated successfully', profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user!.userId);
    const { category, severity } = req.query;

    const worldModel = await PatientWorldModel.findOne({ patientId });
    if (!worldModel) {
      res.json({ success: true, timeline: [], baselines: {} });
      return;
    }

    let events = worldModel.timeline;
    if (category) {
      events = events.filter((e) => e.category.toLowerCase() === (category as string).toLowerCase());
    }
    if (severity) {
      events = events.filter((e) => e.severity === severity);
    }

    res.json({
      success: true,
      timeline: events,
      baselines: worldModel.baselines,
      trends: worldModel.currentTrends,
      totalEvents: worldModel.totalEventsCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMedications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user!.userId);
    const medications = await Medication.find({ patientId }).sort({ createdAt: -1 });
    res.json({ success: true, medications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addMedication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user!.userId);
    const { name, dosage, frequency, timing, foodInstructions, purpose, startDate } = req.body;

    const existingMeds = await Medication.find({ patientId, isActive: true });
    const duplicateWarning = medicationAgentInstance.detectDuplicates(existingMeds, name);
    const interactions = medicationAgentInstance.checkInteractions([...existingMeds.map((m) => m.name), name]);

    const medication = await Medication.create({
      patientId,
      name,
      dosage,
      frequency,
      timing: timing || { morning: true, afternoon: false, evening: false, night: false },
      foodInstructions: foodInstructions || 'With water',
      purpose: purpose || 'Cardiovascular regulation',
      startDate: startDate ? new Date(startDate) : new Date(),
      duplicateWarning: duplicateWarning || undefined,
      potentialInteractions: interactions.map((i) => i.description),
      isActive: true,
    });

    await careOrchestratorInstance.updatePatientWorldModel(
      patientId,
      'MEDICATION_STARTED',
      `Medication Added: ${name} ${dosage}`,
      `Patient initiated ${name} (${frequency}).`,
      'Medication',
      duplicateWarning ? 'moderate' : 'normal'
    );

    res.status(201).json({ success: true, medication, warning: duplicateWarning });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logMedicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { medicationId } = req.params;
    const { slot, status, date } = req.body; // status: 'taken' | 'missed'

    const targetDate = date || new Date().toISOString().split('T')[0];
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      res.status(404).json({ success: false, message: 'Medication not found' });
      return;
    }

    // Upsert log
    const existingLogIdx = medication.logs.findIndex((l) => l.date === targetDate && l.slot === slot);
    if (existingLogIdx >= 0) {
      medication.logs[existingLogIdx].status = status;
      medication.logs[existingLogIdx].recordedAt = new Date();
    } else {
      medication.logs.push({
        date: targetDate,
        slot,
        status,
        recordedAt: new Date(),
      });
    }

    medication.adherenceRate = medicationAgentInstance.calculateAdherence(medication.logs);
    await medication.save();

    res.json({ success: true, medication });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addWearableReading = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user!.userId);
    const { heartRate, bloodPressure, oxygenSaturation, activity, sleep, weightKg } = req.body;

    const metric = await WearableMetric.create({
      patientId,
      timestamp: new Date(),
      source: 'manual',
      heartRate: heartRate || { currentBpm: 72 },
      bloodPressure: bloodPressure || { systolic: 120, diastolic: 80 },
      oxygenSaturation: oxygenSaturation || { spo2Percentage: 98 },
      activity: activity || { steps: 7500, activeCalories: 400 },
      sleep: sleep || { totalHours: 7.5 },
      weightKg,
    });

    // Check for critical BP / HR anomaly
    let isAnomaly = false;
    let anomalyNote = '';
    if (bloodPressure && (bloodPressure.systolic >= 160 || bloodPressure.diastolic >= 100)) {
      isAnomaly = true;
      anomalyNote = `Severe elevated blood pressure (${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg)`;
    } else if (heartRate && (heartRate.currentBpm >= 110 || heartRate.currentBpm <= 48)) {
      isAnomaly = true;
      anomalyNote = `Resting heart rate anomaly (${heartRate.currentBpm} bpm)`;
    }

    if (isAnomaly) {
      await careOrchestratorInstance.updatePatientWorldModel(
        patientId,
        'WEARABLE_ANOMALY',
        'Vitals Alert Detected',
        anomalyNote,
        'Alert',
        'critical'
      );
    }

    res.status(201).json({ success: true, metric });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user!.userId);
    const reports = await MedicalReport.find({ patientId }).sort({ reportDate: -1 });
    res.json({ success: true, reports });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEcgRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user!.userId);
    const ecgs = await ECGRecord.find({ patientId }).sort({ recordDate: -1 });
    res.json({ success: true, ecgs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ recipientUserId: req.user!.userId }).sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

