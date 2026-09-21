import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalReport extends Document {
  patientId: mongoose.Types.ObjectId;
  reportType: 'ECG' | 'Blood Test' | 'Echocardiography' | 'Lipid Profile' | 'Prescription' | 'Discharge Summary' | 'Doctor Note' | 'Other';
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  reportDate: Date;
  doctorName?: string;
  hospitalName?: string;
  extractedRawText?: string;
  extractedData: {
    diagnosis?: string[];
    labValues?: Array<{ parameter: string; value: string | number; unit: string; referenceRange: string; isAbnormal: boolean }>;
    medications?: Array<{ name: string; dosage: string; frequency: string; duration?: string }>;
    ecgFindings?: {
      measurementsAvailable?: boolean;
      heartRateBpm?: number;
      prIntervalMs?: number;
      qrsDurationMs?: number;
      qtIntervalMs?: number;
      qtcIntervalMs?: number;
      rhythm?: string;
      stSegmentChanges?: string;
      abnormalitiesDetected?: string[];
    };
    aiSummary?: string;
    riskScoreContribution?: number;
  };
  confirmedByPatient: boolean;
  status: 'processing' | 'extracted' | 'verified' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const MedicalReportSchema = new Schema<IMedicalReport>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportType: {
      type: String,
      enum: ['ECG', 'Blood Test', 'Echocardiography', 'Lipid Profile', 'Prescription', 'Discharge Summary', 'Doctor Note', 'Other'],
      required: true,
    },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: 'application/pdf' },
    fileSize: { type: Number, default: 0 },
    reportDate: { type: Date, default: Date.now },
    doctorName: { type: String },
    hospitalName: { type: String },
    extractedRawText: { type: String },
    extractedData: {
      diagnosis: { type: [String], default: [] },
      labValues: [
        {
          parameter: { type: String },
          value: { type: Schema.Types.Mixed },
          unit: { type: String },
          referenceRange: { type: String },
          isAbnormal: { type: Boolean, default: false },
        },
      ],
      medications: [
        {
          name: { type: String },
          dosage: { type: String },
          frequency: { type: String },
          duration: { type: String },
        },
      ],
      ecgFindings: {
        measurementsAvailable: { type: Boolean, default: false },
        heartRateBpm: { type: Number },
        prIntervalMs: { type: Number },
        qrsDurationMs: { type: Number },
        qtIntervalMs: { type: Number },
        qtcIntervalMs: { type: Number },
        rhythm: { type: String },
        stSegmentChanges: { type: String },
        abnormalitiesDetected: { type: [String], default: [] },
      },
      aiSummary: { type: String },
      riskScoreContribution: { type: Number, default: 0 },
    },
    confirmedByPatient: { type: Boolean, default: true },
    status: { type: String, enum: ['processing', 'extracted', 'verified', 'failed'], default: 'extracted' },
  },
  { timestamps: true }
);

export const MedicalReport = mongoose.model<IMedicalReport>('MedicalReport', MedicalReportSchema);

