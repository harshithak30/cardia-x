export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  profile?: PatientProfile | DoctorProfile;
}

export interface PatientProfile {
  _id: string;
  userId: string | User;
  dob?: string;
  age?: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  heightCm: number;
  weightKg: number;
  bmi?: number;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory: {
    heartDiseases: string[];
    hasHypertension: boolean;
    hasDiabetes: boolean;
    hasAsthma: boolean;
    allergies: string[];
    familyCardiacHistory: string;
    previousSurgeries: string[];
    smokingStatus: 'never' | 'former' | 'current';
    alcoholConsumption: 'none' | 'occasional' | 'moderate' | 'heavy';
  };
  lifestyle: {
    exerciseFrequency: 'sedentary' | 'light' | 'moderate' | 'active';
    dailyStepGoal: number;
    sleepPatternHours: number;
    dietPreference: 'balanced' | 'low-sodium' | 'mediterranean' | 'vegetarian' | 'other';
    stressLevel: 'low' | 'moderate' | 'high';
  };
  assignedDoctorId?: any;
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  currentHealthScore: number;
  adherencePercentage: number;
}

export interface DoctorProfile {
  _id: string;
  userId: string | User;
  medicalRegNumber: string;
  hospitalName: string;
  specialization: string;
  yearsOfExperience: number;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  bio?: string;
  assignedPatients: string[];
}

export interface WearableMetric {
  _id: string;
  patientId: string;
  timestamp: string;
  source: string;
  heartRate: {
    currentBpm: number;
    restingBpm?: number;
    minBpm?: number;
    maxBpm?: number;
    variabilityMs?: number;
  };
  bloodPressure: {
    systolic: number;
    diastolic: number;
    pulsePressure?: number;
    map?: number;
    category?: string;
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
}

export interface ECGRecord {
  _id: string;
  patientId: string;
  reportId?: string;
  recordDate: string;
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
    previousEcgId?: string;
    previousDate?: string;
    changesDetected: string[];
    isDeteriorating: boolean;
    deltaNotes: string;
  };
  waveformPoints: number[];
  doctorVerified: boolean;
  doctorNotes?: string;
}

export interface MedicalReport {
  _id: string;
  patientId: string;
  reportType: 'ECG' | 'Blood Test' | 'Echocardiography' | 'Lipid Profile' | 'Prescription' | 'Discharge Summary' | 'Doctor Note' | 'Other';
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  reportDate: string;
  doctorName?: string;
  hospitalName?: string;
  extractedData: {
    diagnosis?: string[];
    labValues?: Array<{ parameter: string; value: string | number; unit: string; referenceRange: string; isAbnormal: boolean }>;
    medications?: Array<{ name: string; dosage: string; frequency: string; duration?: string }>;
    ecgFindings?: any;
    aiSummary?: string;
  };
  confirmedByPatient: boolean;
  status: 'processing' | 'extracted' | 'verified' | 'failed';
  createdAt: string;
}

export interface Medication {
  _id: string;
  patientId: string;
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
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  isActive: boolean;
  logs: Array<{
    date: string;
    slot: 'morning' | 'afternoon' | 'evening' | 'night';
    status: 'taken' | 'missed' | 'skipped' | 'pending';
    recordedAt: string;
  }>;
  adherenceRate: number;
  potentialInteractions: string[];
  duplicateWarning?: string;
}

export interface Symptom {
  _id: string;
  patientId: string;
  reportedAt: string;
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
  triageSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  aiRecommendation: string;
  escalatedToDoctor: boolean;
  reviewedByDoctor: boolean;
  doctorNotes?: string;
}

export interface Investigation {
  _id: string;
  patientId: string | User;
  testName: string;
  category: 'Electrophysiology' | 'Biomarkers' | 'Imaging' | 'Hemodynamics' | 'General';
  priority: 'Urgent' | 'Routine' | 'Elective';
  status: 'recommended_by_ai' | 'ordered_by_doctor' | 'scheduled' | 'completed' | 'cancelled' | 'rejected_by_doctor';
  aiRationale: string;
  clinicalGuidelineReference?: string;
  confidenceScore: number;
  scheduledDate?: string;
  doctorNotes?: string;
}

export interface RiskAssessment {
  _id: string;
  patientId: string | User;
  assessmentDate: string;
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  confidenceScore: number;
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
  doctorNotes?: string;
}

export interface TimelineEvent {
  id: string;
  eventType: string;
  timestamp: string;
  title: string;
  summary: string;
  category: 'ECG' | 'Lab' | 'Medication' | 'Symptom' | 'Vitals' | 'Doctor' | 'Investigation' | 'Alert';
  severity?: 'normal' | 'moderate' | 'critical';
  metadata?: any;
}

export interface PatientWorldModel {
  _id: string;
  patientId: string;
  timeline: TimelineEvent[];
  baselines: {
    restingHeartRateBpm: number;
    systolicBp: number;
    diastolicBp: number;
    ldlCholesterolMgDl: number;
    hba1cPercentage: number;
    lastEcgDate?: string;
    lastEcgRhythm?: string;
    lastEcgQtcMs?: number;
    weightKg: number;
  };
  currentTrends: {
    heartRateTrend: string;
    bpTrend: string;
    cholesterolTrend: string;
    adherenceTrend: string;
    deteriorationRiskScore: number;
    aiClinicalNarrative: string;
  };
  totalEventsCount: number;
  lastUpdated: string;
}

export interface Notification {
  _id: string;
  recipientUserId: string;
  role: UserRole;
  category: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface ClinicalGuideline {
  id: string;
  organization: string;
  title: string;
  topic: string;
  keywords: string[];
  recommendationText: string;
  levelOfEvidence: string;
  actionableSummary: string;
}

export interface AIWorkflow {
  _id: string;
  workflowId: string;
  patientId: string;
  initiator: string;
  triggerEvent: string;
  agentTraces: Array<{
    agentName: string;
    action: string;
    inputSummary: string;
    outputSummary: string;
    confidenceScore: number;
    durationMs: number;
    timestamp: string;
  }>;
  safetyCheck: {
    passed: boolean;
    reason: string;
    riskTier: string;
    requiresHumanReview: boolean;
  };
  finalOutput: string;
  status: string;
  createdAt: string;
}

