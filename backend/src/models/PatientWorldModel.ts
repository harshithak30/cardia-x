import mongoose, { Schema, Document } from 'mongoose';

export interface ITimelineEvent {
  id: string;
  eventType: string; // ECG_UPLOADED, REPORT_UPLOADED, SYMPTOM_REPORTED, etc.
  timestamp: Date;
  title: string;
  summary: string;
  category: 'ECG' | 'Lab' | 'Medication' | 'Symptom' | 'Vitals' | 'Doctor' | 'Investigation' | 'Alert';
  severity?: 'normal' | 'moderate' | 'critical';
  metadata?: Record<string, any>;
}

export interface IPatientWorldModel extends Document {
  patientId: mongoose.Types.ObjectId;
  timeline: ITimelineEvent[];
  baselines: {
    restingHeartRateBpm: number;
    systolicBp: number;
    diastolicBp: number;
    ldlCholesterolMgDl: number;
    hba1cPercentage: number;
    lastEcgDate?: Date;
    lastEcgRhythm?: string;
    lastEcgQtcMs?: number;
    weightKg: number;
  };
  currentTrends: {
    heartRateTrend: 'stable' | 'increasing' | 'decreasing' | 'irregular';
    bpTrend: 'optimal' | 'borderline' | 'escalating' | 'controlled';
    cholesterolTrend: 'on_target' | 'elevated' | 'critical';
    adherenceTrend: 'excellent' | 'moderate' | 'poor';
    deteriorationRiskScore: number; // 0 - 100
    aiClinicalNarrative: string;
  };
  totalEventsCount: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PatientWorldModelSchema = new Schema<IPatientWorldModel>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    timeline: [
      {
        id: { type: String, required: true },
        eventType: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        title: { type: String, required: true },
        summary: { type: String, required: true },
        category: {
          type: String,
          enum: ['ECG', 'Lab', 'Medication', 'Symptom', 'Vitals', 'Doctor', 'Investigation', 'Alert'],
          required: true,
        },
        severity: { type: String, enum: ['normal', 'moderate', 'critical'], default: 'normal' },
        metadata: { type: Schema.Types.Mixed },
      },
    ],
    baselines: {
      restingHeartRateBpm: { type: Number, default: 70 },
      systolicBp: { type: Number, default: 120 },
      diastolicBp: { type: Number, default: 80 },
      ldlCholesterolMgDl: { type: Number, default: 95 },
      hba1cPercentage: { type: Number, default: 5.6 },
      lastEcgDate: { type: Date },
      lastEcgRhythm: { type: String, default: 'Normal Sinus Rhythm' },
      lastEcgQtcMs: { type: Number, default: 420 },
      weightKg: { type: Number, default: 72 },
    },
    currentTrends: {
      heartRateTrend: { type: String, enum: ['stable', 'increasing', 'decreasing', 'irregular'], default: 'stable' },
      bpTrend: { type: String, enum: ['optimal', 'borderline', 'escalating', 'controlled'], default: 'optimal' },
      cholesterolTrend: { type: String, enum: ['on_target', 'elevated', 'critical'], default: 'on_target' },
      adherenceTrend: { type: String, enum: ['excellent', 'moderate', 'poor'], default: 'excellent' },
      deteriorationRiskScore: { type: Number, default: 12 },
      aiClinicalNarrative: {
        type: String,
        default: 'Patient maintains stable cardiovascular hemodynamics with normal sinus rhythm and good medication compliance.',
      },
    },
    totalEventsCount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const PatientWorldModel = mongoose.model<IPatientWorldModel>('PatientWorldModel', PatientWorldModelSchema);

