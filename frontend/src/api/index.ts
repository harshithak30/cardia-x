import { apiRequest } from './client';
import {
  User,
  PatientProfile,
  MedicalReport,
  ECGRecord,
  Medication,
  HistoricalPrescription,
  WearableMetric,
  Investigation,
  RiskAssessment,
  TimelineEvent,
  Notification,
  ClinicalGuideline,
  AIWorkflow,
} from '../types';

export const authApi = {
  login: (data: { email: string; password: string; expectedRole?: string }) =>
    apiRequest<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerPatient: (data: any) =>
    apiRequest<{ success: boolean; token: string; user: User }>('/auth/patient/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerDoctor: (data: any) =>
    apiRequest<{ success: boolean; token: string; user: User }>('/auth/doctor/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => apiRequest<{ success: boolean; user: User }>('/auth/me'),
};

export const patientApi = {
  getDashboard: () =>
    apiRequest<{
      success: boolean;
      dashboard: {
        profile: PatientProfile;
        vitals: { latest: WearableMetric; history: WearableMetric[] };
        ecg: ECGRecord;
        medications: Medication[];
        adherencePercentage: number;
        investigations: Investigation[];
        recentReports: MedicalReport[];
        risk: RiskAssessment;
        worldModelOverview: { narrative: string; trends: any; totalEvents: number };
        notifications: Notification[];
      };
    }>('/patient/dashboard'),

  getProfile: () => apiRequest<{ success: boolean; profile: PatientProfile; assignedDoctor: any | null }>('/patient/profile'),
  updateProfile: (data: Partial<PatientProfile>) =>
    apiRequest<{ success: boolean; profile: PatientProfile }>('/patient/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getTimeline: (params?: { category?: string; severity?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<{
      success: boolean;
      timeline: TimelineEvent[];
      baselines: any;
      trends: any;
      totalEvents: number;
    }>(`/patient/timeline${query ? `?${query}` : ''}`);
  },

  getMedications: () => apiRequest<{ success: boolean; medications: Medication[] }>('/patient/medications'),
  getHistoricalPrescriptions: () =>
    apiRequest<{ success: boolean; prescriptions: HistoricalPrescription[] }>('/patient/prescriptions'),
  uploadHistoricalPrescription: (formData: FormData) =>
    apiRequest<{ success: boolean; prescription: HistoricalPrescription }>('/patient/prescriptions', {
      method: 'POST',
      body: formData,
    }),
  retryHistoricalPrescriptionOcr: (prescriptionId: string) =>
    apiRequest<{ success: boolean; prescription: HistoricalPrescription }>(
      `/patient/prescriptions/${prescriptionId}/retry-ocr`,
      { method: 'POST' }
    ),
  confirmHistoricalPrescription: (
    prescriptionId: string,
    medications: HistoricalPrescription['medications']
  ) =>
    apiRequest<{ success: boolean; prescription: HistoricalPrescription; message: string }>(
      `/patient/prescriptions/${prescriptionId}/confirm`,
      { method: 'POST', body: JSON.stringify({ medications }) }
    ),
  openHistoricalPrescription: async (prescriptionId: string) => {
      const previewWindow = window.open('about:blank', '_blank');
      if (!previewWindow) throw new Error('Allow pop-ups for this site to open the prescription scan.');
    const token = localStorage.getItem('cardia_x_token');
      try {
        const response = await fetch(`/api/patient/prescriptions/${prescriptionId}/file`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error('Could not open this prescription file.');
        const file = await response.blob();
        const objectUrl = URL.createObjectURL(file);
        previewWindow.location.href = objectUrl;
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      } catch (error) {
        previewWindow.close();
        throw error;
      }
  },
  addMedication: (data: any) =>
    apiRequest<{ success: boolean; medication: Medication; warning?: string }>('/patient/medications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logMedication: (medicationId: string, data: { slot: string; status: string; date?: string }) =>
    apiRequest<{ success: boolean; medication: Medication }>(`/patient/medications/${medicationId}/log`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  addWearable: (data: any) =>
    apiRequest<{ success: boolean; metric: WearableMetric }>('/patient/wearables', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getReports: () => apiRequest<{ success: boolean; reports: MedicalReport[] }>('/patient/reports'),
  getEcgs: () => apiRequest<{ success: boolean; ecgs: ECGRecord[] }>('/patient/ecgs'),
  getNotifications: () => apiRequest<{ success: boolean; notifications: Notification[] }>('/patient/notifications'),
  markNotificationRead: (id: string) =>
    apiRequest<{ success: boolean }>(`/patient/notifications/${id}/read`, { method: 'PUT' }),
};

export const notificationApi = {
  getAll: () => apiRequest<{ success: boolean; notifications: Notification[] }>('/notifications'),
  markRead: (id: string) =>
    apiRequest<{ success: boolean; notification: Notification }>(`/notifications/${id}/read`, { method: 'PUT' }),
};

export const doctorApi = {
  getDashboard: () =>
    apiRequest<{
      success: boolean;
      summary: {
        totalPatients: number;
        highRiskCount: number;
        mediumRiskCount: number;
        lowRiskCount: number;
        pendingApprovalsCount: number;
        todayAlertsCount: number;
        pendingApprovals: RiskAssessment[];
        pendingInvestigations: Investigation[];
        criticalAlerts: Notification[];
      };
    }>('/doctor/dashboard'),

  getPatients: (params?: { search?: string; riskLevel?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<{ success: boolean; patients: PatientProfile[] }>(`/doctor/patients${query ? `?${query}` : ''}`);
  },

  getPatient360: (patientId: string) =>
    apiRequest<{
      success: boolean;
      patient360: {
        user: User;
        profile: PatientProfile;
        reports: MedicalReport[];
        ecgs: ECGRecord[];
        medications: Medication[];
        historicalPrescriptions: HistoricalPrescription[];
        symptoms: any[];
        vitalsHistory: WearableMetric[];
        investigations: Investigation[];
        riskHistory: RiskAssessment[];
        worldModel: any;
        doctorNotes: any[];
        aiWorkflows: AIWorkflow[];
      };
    }>(`/doctor/patients/${patientId}`),

  reviewRecommendation: (type: 'risk' | 'investigation', id: string, data: { action: string; notes?: string }) =>
    apiRequest<{ success: boolean; message: string }>(`/doctor/recommendations/${type}/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  addDoctorNote: (patientId: string, data: any) =>
    apiRequest<{ success: boolean; note: any }>(`/doctor/patients/${patientId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  prescribeMedication: (patientId: string, data: any) =>
    apiRequest<{ success: boolean; medication: Medication; warning?: string; interactions?: any[] }>(`/doctor/patients/${patientId}/medications`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const adminApi = {
  getStats: () =>
    apiRequest<{
      success: boolean;
      stats: {
        totalUsers: number;
        totalPatients: number;
        totalDoctors: number;
        pendingDoctorsCount: number;
        totalWorkflows: number;
        totalGuidelines: number;
        recentWorkflows: AIWorkflow[];
        recentAuditLogs: any[];
      };
    }>('/admin/stats'),

  getDoctors: () => apiRequest<{ success: boolean; doctors: any[] }>('/admin/doctors'),
  getPatients: () => apiRequest<{ success: boolean; patients: PatientProfile[] }>('/admin/patients'),
  verifyDoctor: (doctorProfileId: string, status: 'approved' | 'rejected') =>
    apiRequest<{ success: boolean }>(`/admin/doctors/${doctorProfileId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  assignPatient: (doctorProfileId: string, patientId: string) =>
    apiRequest<{ success: boolean; message: string }>(`/admin/doctors/${doctorProfileId}/assign-patient`, {
      method: 'PUT',
      body: JSON.stringify({ patientId }),
    }),

  getGuidelines: () => apiRequest<{ success: boolean; guidelines: ClinicalGuideline[] }>('/admin/guidelines'),
  addGuideline: (data: any) =>
    apiRequest<{ success: boolean; guideline: ClinicalGuideline }>('/admin/guidelines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const aiApi = {
  symptomChat: (data: { message: string; history?: Array<{ role: string; content: string }> }) =>
    apiRequest<{
      success: boolean;
      reply: string;
      triage: any;
    }>('/ai/symptoms/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  evidenceChat: (data: { query: string; sessionId?: string }) =>
    apiRequest<{
      success: boolean;
      sessionId: string;
      answer: string;
      retrievedGuidelines: Array<{
        title: string;
        organization: string;
        recommendationText: string;
        levelOfEvidence: string;
        sourceType?: string;
        relevanceScore: number;
      }>;
      confidenceScore: number;
    }>('/ai/evidence/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getChatHistory: () => apiRequest<{ success: boolean; history: any[] }>('/ai/chat/history'),

  analyzeManualEcg: (data: any) =>
    apiRequest<{ success: boolean; record: ECGRecord }>('/ai/ecg/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadReportFile: (formData: FormData) =>
    apiRequest<{
      success: boolean;
      message: string;
      report: MedicalReport;
      ecg?: ECGRecord;
      riskAssessment?: RiskAssessment;
      investigationsNeeded?: Investigation[];
      workflowId: string;
    }>('/upload/report', {
      method: 'POST',
      body: formData,
    }),
};
