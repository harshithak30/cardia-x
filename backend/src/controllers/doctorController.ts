import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { PatientProfile } from '../models/PatientProfile.js';
import { DoctorProfile } from '../models/DoctorProfile.js';
import { MedicalReport } from '../models/MedicalReport.js';
import { ECGRecord } from '../models/ECGRecord.js';
import { Medication } from '../models/Medication.js';
import { Symptom } from '../models/Symptom.js';
import { WearableMetric } from '../models/WearableMetric.js';
import { Investigation } from '../models/Investigation.js';
import { RiskAssessment } from '../models/RiskAssessment.js';
import { PatientWorldModel } from '../models/PatientWorldModel.js';
import { DoctorNote } from '../models/DoctorNote.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { AIWorkflow } from '../models/AIWorkflow.js';
import { careOrchestratorInstance } from '../agents/CareOrchestrator.js';
import { medicationAgentInstance } from '../agents/MedicationAgent.js';

const getAccessiblePatientIds = async (req: AuthRequest): Promise<mongoose.Types.ObjectId[] | null> => {
  if (req.user?.role === 'admin') return null;

  const profile = await DoctorProfile.findOne({ userId: req.user!.userId }).select('assignedPatients');
  return profile?.assignedPatients || [];
};

const canAccessPatient = async (req: AuthRequest, patientId: mongoose.Types.ObjectId): Promise<boolean> => {
  const accessiblePatientIds = await getAccessiblePatientIds(req);
  return accessiblePatientIds === null || accessiblePatientIds.some((id) => id.equals(patientId));
};

export const getDoctorDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const accessiblePatientIds = await getAccessiblePatientIds(req);
    const patientQuery = accessiblePatientIds === null ? {} : { userId: { $in: accessiblePatientIds } };

    const patients = await PatientProfile.find(patientQuery).populate('userId', 'fullName email phone');
    const patientIds = patients.map((patient) => patient.userId);
    const highRiskPatients = patients.filter((p) => p.overallRiskLevel === 'HIGH');
    const mediumRiskPatients = patients.filter((p) => p.overallRiskLevel === 'MEDIUM');

    // Pending AI approvals
    const pendingApprovals = await RiskAssessment.find({
      approvalStatus: 'pending_approval',
      ...(accessiblePatientIds === null ? {} : { patientId: { $in: patientIds } }),
    }).populate('patientId', 'fullName email');

    // Pending investigations
    const pendingInvestigations = await Investigation.find({
      status: 'recommended_by_ai',
      ...(accessiblePatientIds === null ? {} : { patientId: { $in: patientIds } }),
    }).populate('patientId', 'fullName email');

    // Recent critical alerts
    const criticalAlerts = await Notification.find({
      severity: 'critical',
      ...(accessiblePatientIds === null ? {} : { recipientUserId: { $in: patientIds } }),
    }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      summary: {
        totalPatients: patients.length,
        highRiskCount: highRiskPatients.length,
        mediumRiskCount: mediumRiskPatients.length,
        lowRiskCount: patients.length - highRiskPatients.length - mediumRiskPatients.length,
        pendingApprovalsCount: pendingApprovals.length + pendingInvestigations.length,
        todayAlertsCount: criticalAlerts.length,
        pendingApprovals,
        pendingInvestigations,
        criticalAlerts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientsList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, riskLevel } = req.query;
    const accessiblePatientIds = await getAccessiblePatientIds(req);

    const query: any = {};
    if (accessiblePatientIds !== null) query.userId = { $in: accessiblePatientIds };
    if (riskLevel && riskLevel !== 'ALL') {
      query.overallRiskLevel = riskLevel;
    }

    const profiles = await PatientProfile.find(query).populate('userId', 'fullName email phone');

    let filtered = profiles;
    if (search) {
      const s = (search as string).toLowerCase();
      filtered = profiles.filter(
        (p: any) =>
          p.userId?.fullName?.toLowerCase().includes(s) ||
          p.userId?.email?.toLowerCase().includes(s) ||
          p.medicalHistory?.heartDiseases?.some((d: string) => d.toLowerCase().includes(s))
      );
    }

    res.json({ success: true, patients: filtered });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientDetails360 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    if (!mongoose.isValidObjectId(patientId)) {
      res.status(400).json({ success: false, message: 'Invalid patient ID' });
      return;
    }
    const pId = new mongoose.Types.ObjectId(patientId);

    if (!(await canAccessPatient(req, pId))) {
      res.status(403).json({ success: false, message: 'You are not assigned to this patient.' });
      return;
    }

    const [
      user,
      profile,
      reports,
      ecgs,
      medications,
      symptoms,
      vitalsHistory,
      investigations,
      riskHistory,
      worldModel,
      doctorNotes,
      aiWorkflows,
    ] = await Promise.all([
      User.findById(pId).select('-passwordHash'),
      PatientProfile.findOne({ userId: pId }),
      MedicalReport.find({ patientId: pId }).sort({ reportDate: -1 }),
      ECGRecord.find({ patientId: pId }).sort({ recordDate: -1 }),
      Medication.find({ patientId: pId }).sort({ createdAt: -1 }),
      Symptom.find({ patientId: pId }).sort({ reportedAt: -1 }),
      WearableMetric.find({ patientId: pId }).sort({ timestamp: -1 }).limit(30),
      Investigation.find({ patientId: pId }).sort({ createdAt: -1 }),
      RiskAssessment.find({ patientId: pId }).sort({ assessmentDate: -1 }),
      PatientWorldModel.findOne({ patientId: pId }),
      DoctorNote.find({ patientId: pId }).sort({ noteDate: -1 }),
      AIWorkflow.find({ patientId: pId }).sort({ createdAt: -1 }).limit(10),
    ]);

    if (!user || !profile) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }

    res.json({
      success: true,
      patient360: {
        user,
        profile,
        reports,
        ecgs,
        medications,
        symptoms,
        vitalsHistory: vitalsHistory.reverse(),
        investigations,
        riskHistory,
        worldModel,
        doctorNotes,
        aiWorkflows,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewRecommendation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params; // type: 'risk' | 'investigation'
    const { action, notes } = req.body; // action: 'approved' | 'rejected' | 'modified'
    const doctorId = new mongoose.Types.ObjectId(req.user!.userId);

    if (type === 'risk') {
      const risk = await RiskAssessment.findById(id);
      if (!risk) {
        res.status(404).json({ success: false, message: 'Risk assessment not found' });
        return;
      }
      if (!(await canAccessPatient(req, risk.patientId))) {
        res.status(403).json({ success: false, message: 'You are not assigned to this patient.' });
        return;
      }
      risk.approvalStatus = action;
      risk.approvedByDoctorId = doctorId;
      risk.doctorNotes = notes;
      await risk.save();

      await careOrchestratorInstance.updatePatientWorldModel(
        risk.patientId,
        'DOCTOR_APPROVAL',
        `Doctor Reviewed AI Risk Action: ${action.toUpperCase()}`,
        `Dr. Notes: ${notes || 'Reviewed and signed off.'}`,
        'Doctor',
        action === 'approved' ? 'moderate' : 'normal'
      );

      res.json({ success: true, message: `Recommendation ${action} successfully.`, risk });
    } else if (type === 'investigation') {
      const investigation = await Investigation.findById(id);
      if (!investigation) {
        res.status(404).json({ success: false, message: 'Investigation not found' });
        return;
      }
      if (!(await canAccessPatient(req, investigation.patientId))) {
        res.status(403).json({ success: false, message: 'You are not assigned to this patient.' });
        return;
      }

      investigation.status = action === 'approved' ? 'ordered_by_doctor' : 'rejected_by_doctor';
      investigation.orderedByDoctorId = doctorId;
      investigation.doctorNotes = notes;
      await investigation.save();

      await careOrchestratorInstance.updatePatientWorldModel(
        investigation.patientId,
        'INVESTIGATION_ORDERED',
        `Doctor ${action === 'approved' ? 'Ordered' : 'Rejected'} Test: ${investigation.testName}`,
        `Clinical notes: ${notes || 'Action verified by cardiologist.'}`,
        'Investigation',
        'normal'
      );

      res.json({ success: true, message: `Investigation ${action} successfully.`, investigation });
    } else {
      res.status(400).json({ success: false, message: 'Invalid review type' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addDoctorNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const { title, subjective, objective, assessment, plan, impressions, followUpDate } = req.body;
    const doctorId = new mongoose.Types.ObjectId(req.user!.userId);

    if (!mongoose.isValidObjectId(patientId)) {
      res.status(400).json({ success: false, message: 'Invalid patient ID' });
      return;
    }
    const pId = new mongoose.Types.ObjectId(patientId);
    if (!(await canAccessPatient(req, pId))) {
      res.status(403).json({ success: false, message: 'You are not assigned to this patient.' });
      return;
    }

    const note = await DoctorNote.create({
      doctorId,
      patientId: pId,
      title: title || 'Cardiology Progress Note',
      soap: {
        subjective: subjective || '',
        objective: objective || '',
        assessment: assessment || '',
        plan: plan || '',
      },
      clinicalImpressions: impressions || [],
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
    });

    await careOrchestratorInstance.updatePatientWorldModel(
      pId,
      'DOCTOR_CONSULTATION',
      `Cardiologist Note Added: ${note.title}`,
      `Impression: ${assessment || 'Cardiovascular consultation completed.'}`,
      'Doctor',
      'normal'
    );

    res.status(201).json({ success: true, note });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const prescribeMedication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    if (!mongoose.isValidObjectId(patientId)) {
      res.status(400).json({ success: false, message: 'Invalid patient ID' });
      return;
    }

    const pId = new mongoose.Types.ObjectId(patientId);
    if (!(await canAccessPatient(req, pId))) {
      res.status(403).json({ success: false, message: 'You are not assigned to this patient.' });
      return;
    }

    const { name, genericName, dosage, frequency, timing, foodInstructions, purpose, startDate, endDate } = req.body;
    if (!name || !dosage || !frequency) {
      res.status(400).json({ success: false, message: 'Medication name, dosage, and frequency are required.' });
      return;
    }

    const existingMeds = await Medication.find({ patientId: pId, isActive: true });
    const duplicateWarning = medicationAgentInstance.detectDuplicates(existingMeds, name);
    const interactions = medicationAgentInstance.checkInteractions([...existingMeds.map((med) => med.name), name]);
    const medication = await Medication.create({
      patientId: pId,
      name,
      genericName,
      dosage,
      frequency,
      timing: timing || { morning: true, afternoon: false, evening: false, night: false },
      foodInstructions,
      purpose,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      prescribedBy: req.user!.fullName || 'Cardiologist',
      prescribingDoctorId: req.user!.userId,
      duplicateWarning: duplicateWarning || undefined,
      potentialInteractions: interactions.map((item) => item.description),
      isActive: true,
    });

    await careOrchestratorInstance.updatePatientWorldModel(
      pId,
      'MEDICATION_STARTED',
      `Medication Prescribed: ${name}`,
      `${dosage}, ${frequency}. Prescribed by ${req.user!.fullName || 'assigned cardiologist'}.`,
      'Medication',
      'normal'
    );

    res.status(201).json({ success: true, medication, warning: duplicateWarning, interactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

