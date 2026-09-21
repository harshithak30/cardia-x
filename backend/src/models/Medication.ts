import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicationLog {
  date: string; // YYYY-MM-DD
  slot: 'morning' | 'afternoon' | 'evening' | 'night';
  status: 'taken' | 'missed' | 'skipped' | 'pending';
  recordedAt: Date;
}

export interface IMedication extends Document {
  patientId: mongoose.Types.ObjectId;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  timing: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  foodInstructions?: string;
  purpose?: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy?: string;
  prescribingDoctorId?: mongoose.Types.ObjectId;
  extractedFromReportId?: mongoose.Types.ObjectId;
  isActive: boolean;
  logs: IMedicationLog[];
  adherenceRate: number;
  potentialInteractions: string[];
  duplicateWarning?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema<IMedication>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, default: 'Once daily', trim: true },
    timing: {
      morning: { type: Boolean, default: true },
      afternoon: { type: Boolean, default: false },
      evening: { type: Boolean, default: false },
      night: { type: Boolean, default: false },
    },
    foodInstructions: { type: String, default: 'With water after food' },
    purpose: { type: String, default: 'Cardiovascular management' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    prescribedBy: { type: String, default: 'Cardiologist' },
    prescribingDoctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    extractedFromReportId: { type: Schema.Types.ObjectId, ref: 'MedicalReport' },
    isActive: { type: Boolean, default: true },
    logs: [
      {
        date: { type: String, required: true },
        slot: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], required: true },
        status: { type: String, enum: ['taken', 'missed', 'skipped', 'pending'], default: 'pending' },
        recordedAt: { type: Date, default: Date.now },
      },
    ],
    adherenceRate: { type: Number, default: 100 },
    potentialInteractions: { type: [String], default: [] },
    duplicateWarning: { type: String },
  },
  { timestamps: true }
);

export const Medication = mongoose.model<IMedication>('Medication', MedicationSchema);

