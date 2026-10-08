import mongoose, { Schema, Document } from 'mongoose';
import { randomBytes } from 'node:crypto';

export const createPatientNumber = (): string => `CX-${randomBytes(5).toString('hex').toUpperCase()}`;

export interface IPatientProfile extends Document {
  patientNumber: string;
  userId: mongoose.Types.ObjectId;
  dob?: Date;
  age?: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory: {
    heartDiseases: string[];
    hasHypertension: boolean;
    hasDiabetes: boolean;
    hasAsthma: boolean;
    allergies: string[];
    familyCardiacHistory: string;
    previousSurgeries: string[];
    smokingStatus: 'never' | 'former' | 'current';
    alcoholConsumption: 'none' | 'occasional' | 'moderate' | 'heavy';
  };
  lifestyle: {
    exerciseFrequency: 'sedentary' | 'light' | 'moderate' | 'active';
    dailyStepGoal: number;
    sleepPatternHours: number;
    dietPreference: 'balanced' | 'low-sodium' | 'mediterranean' | 'vegetarian' | 'other';
    stressLevel: 'low' | 'moderate' | 'high';
  };
  assignedDoctorId?: mongoose.Types.ObjectId;
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  currentHealthScore: number;
  adherencePercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const PatientProfileSchema = new Schema<IPatientProfile>(
  {
    patientNumber: { type: String, unique: true, sparse: true, immutable: true, default: createPatientNumber },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dob: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    bloodGroup: { type: String, default: 'O+' },
    heightCm: { type: Number, default: 175 },
    weightKg: { type: Number, default: 72 },
    bmi: { type: Number },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },
    medicalHistory: {
      heartDiseases: { type: [String], default: [] },
      hasHypertension: { type: Boolean, default: false },
      hasDiabetes: { type: Boolean, default: false },
      hasAsthma: { type: Boolean, default: false },
      allergies: { type: [String], default: [] },
      familyCardiacHistory: { type: String, default: 'None reported' },
      previousSurgeries: { type: [String], default: [] },
      smokingStatus: { type: String, enum: ['never', 'former', 'current'], default: 'never' },
      alcoholConsumption: { type: String, enum: ['none', 'occasional', 'moderate', 'heavy'], default: 'none' },
    },
    lifestyle: {
      exerciseFrequency: { type: String, enum: ['sedentary', 'light', 'moderate', 'active'], default: 'moderate' },
      dailyStepGoal: { type: Number, default: 8000 },
      sleepPatternHours: { type: Number, default: 7 },
      dietPreference: { type: String, enum: ['balanced', 'low-sodium', 'mediterranean', 'vegetarian', 'other'], default: 'balanced' },
      stressLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' },
    },
    assignedDoctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    overallRiskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
    currentHealthScore: { type: Number, default: 85 },
    adherencePercentage: { type: Number, default: 95 },
  },
  { timestamps: true }
);

PatientProfileSchema.pre('save', function (next) {
  if (this.heightCm && this.weightKg) {
    const heightM = this.heightCm / 100;
    this.bmi = parseFloat((this.weightKg / (heightM * heightM)).toFixed(1));
  }
  next();
});

export const PatientProfile = mongoose.model<IPatientProfile>('PatientProfile', PatientProfileSchema);

