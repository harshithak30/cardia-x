import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentTrace {
  agentName: string;
  action: string;
  inputSummary: string;
  outputSummary: string;
  confidenceScore: number;
  durationMs: number;
  timestamp: Date;
}

export interface IAIWorkflow extends Document {
  workflowId: string;
  patientId: mongoose.Types.ObjectId;
  initiator: string;
  triggerEvent: string;
  agentTraces: IAgentTrace[];
  safetyCheck: {
    passed: boolean;
    reason: string;
    riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
    requiresHumanReview: boolean;
  };
  finalOutput: string;
  status: 'running' | 'completed' | 'awaiting_doctor' | 'rejected' | 'failed';
  doctorReview?: {
    doctorId?: mongoose.Types.ObjectId;
    action?: 'approved' | 'rejected' | 'modified';
    reviewNotes?: string;
    reviewedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AIWorkflowSchema = new Schema<IAIWorkflow>(
  {
    workflowId: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    initiator: { type: String, default: 'CareOrchestrator' },
    triggerEvent: { type: String, required: true },
    agentTraces: [
      {
        agentName: { type: String, required: true },
        action: { type: String, required: true },
        inputSummary: { type: String, required: true },
        outputSummary: { type: String, required: true },
        confidenceScore: { type: Number, default: 0.95 },
        durationMs: { type: Number, default: 120 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    safetyCheck: {
      passed: { type: Boolean, default: true },
      reason: { type: String, default: 'Clinical recommendation conforms to AHA guidelines.' },
      riskTier: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
      requiresHumanReview: { type: Boolean, default: false },
    },
    finalOutput: { type: String, required: true },
    status: {
      type: String,
      enum: ['running', 'completed', 'awaiting_doctor', 'rejected', 'failed'],
      default: 'completed',
    },
    doctorReview: {
      doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
      action: { type: String, enum: ['approved', 'rejected', 'modified'] },
      reviewNotes: { type: String },
      reviewedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const AIWorkflow = mongoose.model<IAIWorkflow>('AIWorkflow', AIWorkflowSchema);

