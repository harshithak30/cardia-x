import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  retrievedGuidelines?: Array<{
    title: string;
    organization: string; // AHA, ACC, ESC
    recommendationText: string;
    levelOfEvidence: string;
    relevanceScore: number;
  }>;
  confidenceScore?: number;
}

export interface IChatHistory extends Document {
  patientId: mongoose.Types.ObjectId;
  sessionTitle: string;
  messages: IChatMessage[];
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionTitle: { type: String, default: 'Cardiovascular Health Consultation' },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        retrievedGuidelines: [
          {
            title: { type: String },
            organization: { type: String },
            recommendationText: { type: String },
            levelOfEvidence: { type: String },
            relevanceScore: { type: Number },
          },
        ],
        confidenceScore: { type: Number, default: 0.94 },
      },
    ],
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);

