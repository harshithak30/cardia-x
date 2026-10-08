import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { DoctorProfile } from '../models/DoctorProfile.js';
import { PatientProfile } from '../models/PatientProfile.js';
import { AIWorkflow } from '../models/AIWorkflow.js';
import { AuditLog } from '../models/AuditLog.js';
import { ragEngineInstance } from '../rag/ragEngine.js';

export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalPatients, totalDoctors, pendingDoctors, workflows, auditLogs] = await Promise.all([
      User.countDocuments(),
      PatientProfile.countDocuments(),
      DoctorProfile.countDocuments(),
      DoctorProfile.countDocuments({ verificationStatus: 'pending' }),
      AIWorkflow.find().sort({ createdAt: -1 }).limit(20),
      AuditLog.find().sort({ createdAt: -1 }).limit(30),
    ]);

    const guidelines = ragEngineInstance.getAllGuidelines();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        pendingDoctorsCount: pendingDoctors,
        totalWorkflows: await AIWorkflow.countDocuments(),
        totalGuidelines: guidelines.length,
        recentWorkflows: workflows,
        recentAuditLogs: auditLogs,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorsList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctors = await DoctorProfile.find().populate('userId', 'fullName email phone isActive');
    res.json({ success: true, doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientsList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patients = await PatientProfile.find()
      .populate('userId', 'fullName email phone')
      .populate('assignedDoctorId', 'fullName');
    res.json({ success: true, patients });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignPatientToDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorProfileId } = req.params;
    const { patientId } = req.body;
    const [doctor, patient] = await Promise.all([
      DoctorProfile.findById(doctorProfileId),
      PatientProfile.findOne({ userId: patientId }),
    ]);

    if (!doctor || !patient) {
      res.status(404).json({ success: false, message: 'Doctor or patient not found.' });
      return;
    }

    if (doctor.verificationStatus !== 'approved') {
      res.status(400).json({ success: false, message: 'Approve the doctor before assigning patients.' });
      return;
    }

    if (patient.assignedDoctorId && !patient.assignedDoctorId.equals(doctor.userId)) {
      await DoctorProfile.updateOne(
        { userId: patient.assignedDoctorId },
        { $pull: { assignedPatients: patient.userId } }
      );
    }

    patient.assignedDoctorId = doctor.userId;
    await patient.save();
    await DoctorProfile.updateOne(
      { _id: doctor._id },
      { $addToSet: { assignedPatients: patient.userId } }
    );

    await AuditLog.create({
      userId: req.user!.userId,
      userRole: 'admin',
      action: 'ASSIGN_PATIENT_TO_DOCTOR',
      targetResourceId: patient.userId.toString(),
      targetResourceType: 'PatientProfile',
      details: { doctorProfileId },
      status: 'SUCCESS',
    });

    res.json({ success: true, message: 'Patient assigned successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDoctorVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorProfileId } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'

    const doctor = await DoctorProfile.findById(doctorProfileId);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }

    doctor.verificationStatus = status;
    doctor.verifiedAt = new Date();
    doctor.verifiedBy = new mongoose.Types.ObjectId(req.user!.userId);
    await doctor.save();

    await AuditLog.create({
      userId: req.user!.userId,
      userRole: 'admin',
      action: `DOCTOR_VERIFICATION_${status.toUpperCase()}`,
      targetResourceId: doctorProfileId,
      status: 'SUCCESS',
    });

    res.json({ success: true, message: `Doctor status updated to ${status}`, doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGuidelines = async (req: Request, res: Response): Promise<void> => {
  try {
    const guidelines = ragEngineInstance.getAllGuidelines();
    res.json({ success: true, guidelines });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addGuideline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, organization, topic, keywords, recommendationText, levelOfEvidence, actionableSummary } = req.body;

    const newDoc = {
      id: `GUIDE-CUSTOM-${Date.now()}`,
      organization: organization || 'ACC/AHA',
      title,
      topic,
      keywords: Array.isArray(keywords) ? keywords : keywords.split(',').map((k: string) => k.trim()),
      recommendationText,
      levelOfEvidence: levelOfEvidence || 'Class I (Level B)',
      actionableSummary,
    };

    ragEngineInstance.addGuideline(newDoc as any);

    await AuditLog.create({
      userId: req.user!.userId,
      userRole: 'admin',
      action: 'ADD_CLINICAL_GUIDELINE',
      details: { title },
      status: 'SUCCESS',
    });

    res.status(201).json({ success: true, guideline: newDoc });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

