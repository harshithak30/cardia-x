import mongoose, { Schema, Document } from 'mongoose';

export interface IECGRecord extends Document {
  patientId: mongoose.Types.ObjectId;
  reportId?: mongoose.Types.ObjectId;
  recordDate: Date;
  leadsCount: number;
  measurementsAvailable?: boolean;
  heartRateBpm: number;
  prIntervalMs: number;
  qrsDurationMs: number;
  qtIntervalMs: number;
  qtcIntervalMs: number;
  rhythm: string;
  axis: string;
  stSegment: string;
  abnormalities: string[];
  aiInterpretation: string;
  baselineComparison: {
    previousEcgId?: mongoose.Types.ObjectId;
    previousDate?: Date;
    changesDetected: string[];
    isDeteriorating: boolean;
    deltaNotes: string;
  };
  waveformPoints: number[];
  doctorVerified: boolean;
  doctorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ECGRecordSchema = new Schema<IECGRecord>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportId: { type: Schema.Types.ObjectId, ref: 'MedicalReport' },
    recordDate: { type: Date, default: Date.now },
    leadsCount: { type: Number, default: 12 },
    measurementsAvailable: { type: Boolean, default: false },
    heartRateBpm: { type: Number, required: true },
    prIntervalMs: { type: Number, default: 160 },
    qrsDurationMs: { type: Number, default: 90 },
    qtIntervalMs: { type: Number, default: 400 },
    qtcIntervalMs: { type: Number, default: 420 },
    rhythm: { type: String, default: 'Normal Sinus Rhythm' },
    axis: { type: String, default: 'Normal' },
    stSegment: { type: String, default: 'Normal, no elevation/depression' },
    abnormalities: { type: [String], default: [] },
    aiInterpretation: { type: String, required: true },
    baselineComparison: {
      previousEcgId: { type: Schema.Types.ObjectId, ref: 'ECGRecord' },
      previousDate: { type: Date },
      changesDetected: { type: [String], default: [] },
      isDeteriorating: { type: Boolean, default: false },
      deltaNotes: { type: String, default: 'Stable compared to historical baseline.' },
    },
    waveformPoints: { type: [Number], default: [] },
    doctorVerified: { type: Boolean, default: false },
    doctorNotes: { type: String },
  },
  { timestamps: true }
);

export const ECGRecord = mongoose.model<IECGRecord>('ECGRecord', ECGRecordSchema);

