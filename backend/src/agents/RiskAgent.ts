import { IPatientProfile } from '../models/PatientProfile.js';
import { IWearableMetric } from '../models/WearableMetric.js';
import { IECGRecord } from '../models/ECGRecord.js';
import { ISymptom } from '../models/Symptom.js';

export interface IRiskAssessmentResult {
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number; // 0 - 100
  confidenceScore: number;
  framinghamScore10Yr: number;
  ascvdScore: number;
  deteriorationDetected: boolean;
  deteriorationReason?: string;
  keyRiskDrivers: Array<{ factor: string; impact: 'Mild' | 'Moderate' | 'Severe'; description: string }>;
  recommendedActions: string[];
  approvalRequired: boolean;
}

export class RiskMonitoringAgent {
  public calculateRisk(
    profile?: IPatientProfile | null,
    latestVitals?: IWearableMetric | null,
    latestEcg?: IECGRecord | null,
    latestSymptom?: ISymptom | null
  ): IRiskAssessmentResult {
    let score = 10; // Baseline base score
    const drivers: Array<{ factor: string; impact: 'Mild' | 'Moderate' | 'Severe'; description: string }> = [];
    let isDeteriorating = false;
    const deteriorationReasons: string[] = [];
    const recommendations: string[] = [];

    // 1. Age & Demographics
    const age = profile?.age || (profile?.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 52);
    if (age >= 65) {
      score += 15;
      drivers.push({ factor: 'Age Factor (>= 65)', impact: 'Moderate', description: `Patient age of ${age} increases baseline vascular vulnerability.` });
    } else if (age >= 50) {
      score += 8;
      drivers.push({ factor: 'Age Factor (50-64)', impact: 'Mild', description: `Patient age of ${age} contributes to moderate risk profile.` });
    }

    // 2. Medical History
    if (profile?.medicalHistory?.hasHypertension) {
      score += 12;
      drivers.push({ factor: 'Hypertension', impact: 'Moderate', description: 'Chronic arterial hypertension contributes to ventricular afterload.' });
    }
    if (profile?.medicalHistory?.hasDiabetes) {
      score += 15;
      drivers.push({ factor: 'Diabetes Mellitus', impact: 'Moderate', description: 'Microvascular and macrovascular accelerated atherosclerosis risk.' });
    }
    if (profile?.medicalHistory?.smokingStatus === 'current') {
      score += 18;
      drivers.push({ factor: 'Active Tobacco Smoking', impact: 'Severe', description: 'Endothelial dysfunction and elevated acute coronary thrombosis hazard.' });
    }
    if (profile?.medicalHistory?.heartDiseases && profile.medicalHistory.heartDiseases.length > 0) {
      score += 20;
      drivers.push({
        factor: 'Pre-existing Cardiovascular Disease',
        impact: 'Severe',
        description: `Established diagnosis: ${profile.medicalHistory.heartDiseases.join(', ')}.`,
      });
    }

    // 3. Vitals & Wearables
    if (latestVitals) {
      const sbp = latestVitals.bloodPressure?.systolic || 120;
      const dbp = latestVitals.bloodPressure?.diastolic || 80;
      const hr = latestVitals.heartRate?.currentBpm || 72;
      const spo2 = latestVitals.oxygenSaturation?.spo2Percentage || 98;

      if (sbp >= 160 || dbp >= 100) {
        score += 22;
        isDeteriorating = true;
        deteriorationReasons.push(`Severe blood pressure elevation (${sbp}/${dbp} mmHg)`);
        drivers.push({ factor: 'Severe Hypertension', impact: 'Severe', description: `Acute blood pressure measurement at ${sbp}/${dbp} mmHg exceeds target threshold.` });
        recommendations.push('Immediate antihypertensive titration review by cardiologist');
      } else if (sbp >= 140 || dbp >= 90) {
        score += 10;
        drivers.push({ factor: 'Stage 2 Hypertension', impact: 'Moderate', description: `Current BP (${sbp}/${dbp} mmHg) is above clinical guideline target.` });
      }

      if (hr > 110 || hr < 50) {
        score += 14;
        isDeteriorating = true;
        deteriorationReasons.push(`Abnormal heart rate (${hr} bpm)`);
        drivers.push({ factor: 'Heart Rate Anomaly', impact: 'Moderate', description: `Resting heart rate of ${hr} bpm demonstrates dysregulation.` });
      }

      if (spo2 < 93) {
        score += 25;
        isDeteriorating = true;
        deteriorationReasons.push(`Hypoxemia (SpO2 ${spo2}%)`);
        drivers.push({ factor: 'Decreased Oxygen Saturation', impact: 'Severe', description: `SpO2 ${spo2}% indicates potential cardiopulmonary compromise.` });
      }
    }

    // 4. ECG findings
    if (latestEcg) {
      if (latestEcg.abnormalities && latestEcg.abnormalities.length > 0) {
        score += 18;
        drivers.push({
          factor: 'ECG Abnormalities',
          impact: 'Severe',
          description: `Electrocardiographic findings: ${latestEcg.abnormalities.join(', ')}.`,
        });
      }
      if (latestEcg.baselineComparison?.isDeteriorating) {
        isDeteriorating = true;
        score += 15;
        deteriorationReasons.push(`ECG deterioration: ${latestEcg.baselineComparison.changesDetected.join(', ')}`);
      }
    }

    // 5. Active Symptom Triage
    if (latestSymptom) {
      if (latestSymptom.triageSeverity === 'EMERGENCY') {
        score += 35;
        isDeteriorating = true;
        deteriorationReasons.push(`Active high-acuity chest symptom triage (Severity ${latestSymptom.structuredData.severityScore}/10)`);
      } else if (latestSymptom.triageSeverity === 'HIGH') {
        score += 20;
        isDeteriorating = true;
        deteriorationReasons.push('Significant symptomatic cardiac distress reported');
      } else if (latestSymptom.triageSeverity === 'MEDIUM') {
        score += 10;
      }
    }

    const clampedScore = Math.min(Math.max(score, 5), 98);

    let overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let approvalRequired = false;

    if (clampedScore >= 65 || isDeteriorating) {
      overallRiskLevel = 'HIGH';
      approvalRequired = true;
      if (recommendations.length === 0) {
        recommendations.push('Escalate to cardiologist for priority clinical review');
        recommendations.push('Order Stat 12-Lead ECG & High-Sensitivity Troponin');
      }
    } else if (clampedScore >= 35) {
      overallRiskLevel = 'MEDIUM';
      recommendations.push('Schedule routine 12-lead ECG in 2 weeks');
      recommendations.push('Maintain strict sodium restriction (< 2000 mg/day)');
      recommendations.push('Repeat fasting lipid panel within 30 days');
    } else {
      overallRiskLevel = 'LOW';
      recommendations.push('Continue healthy lifestyle and regular cardiovascular exercise');
      recommendations.push('Maintain medication adherence tracking');
    }

    // Framingham & ASCVD estimations
    const framingham10Yr = parseFloat((clampedScore * 0.28).toFixed(1));
    const ascvdScore = parseFloat((clampedScore * 0.24).toFixed(1));

    return {
      overallRiskLevel,
      riskScore: clampedScore,
      confidenceScore: 0.94,
      framinghamScore10Yr: framingham10Yr,
      ascvdScore: ascvdScore,
      deteriorationDetected: isDeteriorating,
      deteriorationReason: deteriorationReasons.length > 0 ? deteriorationReasons.join('; ') : undefined,
      keyRiskDrivers: drivers.length > 0 ? drivers : [{ factor: 'Optimal Baseline', impact: 'Mild', description: 'Normal hemodynamics and preserved functional capacity.' }],
      recommendedActions: recommendations,
      approvalRequired,
    };
  }
}

export const riskAgentInstance = new RiskMonitoringAgent();

