import mongoose, { Schema, Document } from 'mongoose';

export interface ISymptom extends Document {
  patientId: mongoose.Types.ObjectId;
  reportedAt: Date;
  primaryComplaint: string;
  structuredData: {
    duration: string;
    severityScore: number;
    painLocation: string;
    painCharacter: string;
    breathlessness: boolean;
    palpitations: boolean;
    sweatingDiaphoresis: boolean;
    dizziness: boolean;
    radiatingToArmOrJaw: boolean;
    previousEpisodes: boolean;
    medicationsTakenToday: string[];
  };
  conversationTranscript: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  triageSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  aiRecommendation: string;
  escalatedToDoctor: boolean;
  reviewedByDoctor: boolean;
  doctorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SymptomSchema = new Schema<ISymptom>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedAt: { type: Date, default: Date.now },
    primaryComplaint: { type: String, required: true },
    structuredData: {
      duration: { type: String, default: '30 mins' },
      severityScore: { type: Number, min: 1, max: 10, default: 4 },
      painLocation: { type: String, default: 'Chest center' },
      painCharacter: { type: String, default: 'Pressure' },
      breathlessness: { type: Boolean, default: false },
      palpitations: { type: Boolean, default: false },
      sweatingDiaphoresis: { type: Boolean, default: false },
      dizziness: { type: Boolean, default: false },
      radiatingToArmOrJaw: { type: Boolean, default: false },
      previousEpisodes: { type: Boolean, default: false },
      medicationsTakenToday: { type: [String], default: [] },
    },
    conversationTranscript: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    triageSeverity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'], default: 'LOW' },
    aiRecommendation: { type: String },
    escalatedToDoctor: { type: Boolean, default: false },
    reviewedByDoctor: { type: Boolean, default: false },
    doctorNotes: { type: String },
  },
  { timestamps: true }
);

export const Symptom = mongoose.model<ISymptom>('Symptom', SymptomSchema);

