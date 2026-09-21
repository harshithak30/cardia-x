import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { PatientProfile } from '../models/PatientProfile.js';
import { DoctorProfile } from '../models/DoctorProfile.js';
import { PatientWorldModel } from '../models/PatientWorldModel.js';
import { AuditLog } from '../models/AuditLog.js';
import { JWT_SECRET } from '../config/constants.js';
import { AuthRequest } from '../middleware/auth.js';

export const registerPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      dob,
      gender,
      bloodGroup,
      heightCm,
      weightKg,
      emergencyContact,
      medicalHistory,
      lifestyle,
    } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'patient',
      phone,
    });

    const birthYear = dob ? new Date(dob).getFullYear() : 1980;
    const calculatedAge = new Date().getFullYear() - birthYear;

    const profile = await PatientProfile.create({
      userId: user._id,
      dob: dob ? new Date(dob) : undefined,
      age: calculatedAge,
      gender: gender || 'male',
      bloodGroup: bloodGroup || 'O+',
      heightCm: Number(heightCm) || 175,
      weightKg: Number(weightKg) || 72,
      emergencyContact: emergencyContact || { name: 'Family Contact', relationship: 'Spouse', phone: phone || '' },
      medicalHistory: medicalHistory || {
        heartDiseases: [],
        hasHypertension: false,
        hasDiabetes: false,
        hasAsthma: false,
        allergies: [],
        familyCardiacHistory: 'None',
        previousSurgeries: [],
        smokingStatus: 'never',
        alcoholConsumption: 'none',
      },
      lifestyle: lifestyle || {
        exerciseFrequency: 'moderate',
        dailyStepGoal: 8000,
        sleepPatternHours: 7,
        dietPreference: 'balanced',
        stressLevel: 'moderate',
      },
      overallRiskLevel: 'LOW',
      currentHealthScore: 88,
      adherencePercentage: 100,
    });

    // Initialize Patient World Model
    await PatientWorldModel.create({
      patientId: user._id,
      timeline: [
        {
          id: `INIT-${Date.now()}`,
          eventType: 'PATIENT_REGISTERED',
          timestamp: new Date(),
          title: 'Account Registered',
          summary: `Patient ${fullName} registered with CARDIA-X Longitudinal Care Network.`,
          category: 'Doctor',
          severity: 'normal',
        },
      ],
      totalEventsCount: 1,
    });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      userRole: 'patient',
      action: 'PATIENT_SIGNUP',
      status: 'SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

export const registerDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone, medicalRegNumber, hospitalName, specialization, yearsOfExperience, bio } =
      req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'doctor',
      phone,
    });

    const profile = await DoctorProfile.create({
      userId: user._id,
      medicalRegNumber,
      hospitalName,
      specialization: specialization || 'Cardiologist',
      yearsOfExperience: Number(yearsOfExperience) || 8,
      verificationStatus: 'pending',
      bio: bio || `Specialist in cardiovascular intervention, preventative cardiology, and electrophysiology.`,
      assignedPatients: [],
    });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      userRole: 'doctor',
      action: 'DOCTOR_SIGNUP',
      status: 'SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        doctorProfile: profile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Doctor registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, expectedRole } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (expectedRole && user.role !== expectedRole) {
      res.status(403).json({
        success: false,
        message: `This login portal is reserved for ${expectedRole}s. Your account is registered as a ${user.role}.`,
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    let profileData: any = null;
    if (user.role === 'patient') {
      profileData = await PatientProfile.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profileData = await DoctorProfile.findOne({ userId: user._id });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'LOGIN',
      status: 'SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: `Welcome back, ${user.fullName}`,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile: profileData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    let profile: any = null;
    if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

