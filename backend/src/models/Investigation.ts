import mongoose, { Schema, Document } from 'mongoose';

export interface IInvestigation extends Document {
  patientId: mongoose.Types.ObjectId;
  testName: string;
  category: 'Electrophysiology' | 'Biomarkers' | 'Imaging' | 'Hemodynamics' | 'General';
  priority: 'Urgent' | 'Routine' | 'Elective';
  status: 'recommended_by_ai' | 'ordered_by_doctor' | 'scheduled' | 'completed' | 'cancelled' | 'rejected_by_doctor';
  aiRationale: string;
  clinicalGuidelineReference?: string;
  confidenceScore: number;
  orderedByDoctorId?: mongoose.Types.ObjectId;
  completedReportId?: mongoose.Types.ObjectId;
  resultSummary?: string;
  scheduledDate?: Date;
  completedDate?: Date;
  doctorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestigationSchema = new Schema<IInvestigation>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    testName: { type: String, required: true },
    category: {
      type: String,
      enum: ['Electrophysiology', 'Biomarkers', 'Imaging', 'Hemodynamics', 'General'],
      default: 'General',
    },
    priority: { type: String, enum: ['Urgent', 'Routine', 'Elective'], default: 'Routine' },
    status: {
      type: String,
      enum: ['recommended_by_ai', 'ordered_by_doctor', 'scheduled', 'completed', 'cancelled', 'rejected_by_doctor'],
      default: 'recommended_by_ai',
    },
    aiRationale: { type: String, required: true },
    clinicalGuidelineReference: { type: String },
    confidenceScore: { type: Number, default: 0.88 },
    orderedByDoctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    completedReportId: { type: Schema.Types.ObjectId, ref: 'MedicalReport' },
    resultSummary: { type: String },
    scheduledDate: { type: Date },
    completedDate: { type: Date },
    doctorNotes: { type: String },
  },
  { timestamps: true }
);

export const Investigation = mongoose.model<IInvestigation>('Investigation', InvestigationSchema);

