import mongoose, { Schema, Document } from 'mongoose';

export interface IRiskAssessment extends Document {
  patientId: mongoose.Types.ObjectId;
  assessmentDate: Date;
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number; // 0 to 100
  confidenceScore: number; // 0 to 1
  keyRiskDrivers: Array<{
    factor: string;
    impact: 'Mild' | 'Moderate' | 'Severe';
    description: string;
  }>;
  framinghamScore10Yr?: number;
  ascvdScore?: number;
  deteriorationDetected: boolean;
  deteriorationReason?: string;
  recommendedActions: string[];
  approvalRequired: boolean;
  approvalStatus: 'auto_processed' | 'pending_approval' | 'approved' | 'rejected' | 'modified';
  approvedByDoctorId?: mongoose.Types.ObjectId;
  doctorNotes?: string;
  actionTaken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RiskAssessmentSchema = new Schema<IRiskAssessment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assessmentDate: { type: Date, default: Date.now },
    overallRiskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
    riskScore: { type: Number, min: 0, max: 100, required: true },
    confidenceScore: { type: Number, min: 0, max: 1, default: 0.92 },
    keyRiskDrivers: [
      {
        factor: { type: String, required: true },
        impact: { type: String, enum: ['Mild', 'Moderate', 'Severe'], default: 'Moderate' },
        description: { type: String, required: true },
      },
    ],
    framinghamScore10Yr: { type: Number },
    ascvdScore: { type: Number },
    deteriorationDetected: { type: Boolean, default: false },
    deteriorationReason: { type: String },
    recommendedActions: { type: [String], default: [] },
    approvalRequired: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['auto_processed', 'pending_approval', 'approved', 'rejected', 'modified'],
      default: 'auto_processed',
    },
    approvedByDoctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    doctorNotes: { type: String },
    actionTaken: { type: String },
  },
  { timestamps: true }
);

export const RiskAssessment = mongoose.model<IRiskAssessment>('RiskAssessment', RiskAssessmentSchema);

