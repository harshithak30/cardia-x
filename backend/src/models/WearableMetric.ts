import mongoose, { Schema, Document } from 'mongoose';

export interface IWearableMetric extends Document {
  patientId: mongoose.Types.ObjectId;
  timestamp: Date;
  source: 'apple_health' | 'google_fit' | 'fitbit' | 'garmin' | 'manual';
  heartRate: {
    currentBpm: number;
    restingBpm?: number;
    minBpm?: number;
    maxBpm?: number;
    variabilityMs?: number; // HRV
  };
  bloodPressure: {
    systolic: number;
    diastolic: number;
    pulsePressure?: number;
    map?: number; // Mean Arterial Pressure
    category?: 'Normal' | 'Elevated' | 'Stage 1 HTN' | 'Stage 2 HTN' | 'Hypertensive Crisis';
  };
  oxygenSaturation: {
    spo2Percentage: number;
  };
  activity: {
    steps: number;
    activeCalories: number;
    distanceMeters?: number;
  };
  sleep: {
    totalHours: number;
    deepSleepHours?: number;
    remSleepHours?: number;
    awakeMinutes?: number;
  };
  glucose?: {
    fastingMgDl?: number;
    postPrandialMgDl?: number;
    randomMgDl?: number;
  };
  cholesterol?: {
    totalMgDl?: number;
    ldlMgDl?: number;
    hdlMgDl?: number;
    triglyceridesMgDl?: number;
  };
  weightKg?: number;
  isAnomalyDetected: boolean;
  anomalyDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WearableMetricSchema = new Schema<IWearableMetric>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    source: { type: String, enum: ['apple_health', 'google_fit', 'fitbit', 'garmin', 'manual'], default: 'apple_health' },
    heartRate: {
      currentBpm: { type: Number, required: true },
      restingBpm: { type: Number, default: 68 },
      minBpm: { type: Number, default: 58 },
      maxBpm: { type: Number, default: 118 },
      variabilityMs: { type: Number, default: 42 },
    },
    bloodPressure: {
      systolic: { type: Number, required: true },
      diastolic: { type: Number, required: true },
      pulsePressure: { type: Number },
      map: { type: Number },
      category: { type: String, default: 'Normal' },
    },
    oxygenSaturation: {
      spo2Percentage: { type: Number, default: 98 },
    },
    activity: {
      steps: { type: Number, default: 7500 },
      activeCalories: { type: Number, default: 420 },
      distanceMeters: { type: Number, default: 5200 },
    },
    sleep: {
      totalHours: { type: Number, default: 7.2 },
      deepSleepHours: { type: Number, default: 1.8 },
      remSleepHours: { type: Number, default: 1.5 },
      awakeMinutes: { type: Number, default: 25 },
    },
    glucose: {
      fastingMgDl: { type: Number },
      postPrandialMgDl: { type: Number },
      randomMgDl: { type: Number },
    },
    cholesterol: {
      totalMgDl: { type: Number },
      ldlMgDl: { type: Number },
      hdlMgDl: { type: Number },
      triglyceridesMgDl: { type: Number },
    },
    weightKg: { type: Number },
    isAnomalyDetected: { type: Boolean, default: false },
    anomalyDetails: { type: String },
  },
  { timestamps: true }
);

WearableMetricSchema.pre('save', function (next) {
  if (this.bloodPressure && this.bloodPressure.systolic && this.bloodPressure.diastolic) {
    const s = this.bloodPressure.systolic;
    const d = this.bloodPressure.diastolic;
    this.bloodPressure.pulsePressure = s - d;
    this.bloodPressure.map = parseFloat((d + (s - d) / 3).toFixed(1));
    
    if (s > 180 || d > 120) this.bloodPressure.category = 'Hypertensive Crisis';
    else if (s >= 140 || d >= 90) this.bloodPressure.category = 'Stage 2 HTN';
    else if (s >= 130 || d >= 80) this.bloodPressure.category = 'Stage 1 HTN';
    else if (s >= 120 && d < 80) this.bloodPressure.category = 'Elevated';
    else this.bloodPressure.category = 'Normal';
  }
  next();
});

export const WearableMetric = mongoose.model<IWearableMetric>('WearableMetric', WearableMetricSchema);

