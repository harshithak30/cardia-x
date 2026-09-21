import { IPatientProfile } from '../models/PatientProfile.js';
import { IMedicalReport } from '../models/MedicalReport.js';
import { IECGRecord } from '../models/ECGRecord.js';
import { ISymptom } from '../models/Symptom.js';

export interface IInvestigationRecommendation {
  testName: string;
  category: 'Electrophysiology' | 'Biomarkers' | 'Imaging' | 'Hemodynamics' | 'General';
  priority: 'Urgent' | 'Routine' | 'Elective';
  aiRationale: string;
  clinicalGuidelineReference: string;
  confidenceScore: number;
}

export class AdaptiveInvestigationEngine {
  public determineRequiredInvestigations(
    profile?: IPatientProfile | null,
    recentReports: IMedicalReport[] = [],
    recentEcg?: IECGRecord | null,
    recentSymptom?: ISymptom | null
  ): IInvestigationRecommendation[] {
    const recommendations: IInvestigationRecommendation[] = [];
    const now = new Date().getTime();

    // Helper: Days since last test of specific type
    const findDaysSinceReport = (type: string) => {
      const match = recentReports.find((r) => r.reportType.toLowerCase().includes(type.toLowerCase()));
      if (!match) return 999;
      return Math.floor((now - new Date(match.reportDate).getTime()) / (1000 * 60 * 60 * 24));
    };

    const daysSinceEcg = recentEcg ? Math.floor((now - new Date(recentEcg.recordDate).getTime()) / (1000 * 60 * 60 * 24)) : 999;
    const daysSinceLipid = findDaysSinceReport('lipid');
    const daysSinceEcho = findDaysSinceReport('echo');
    const daysSinceTroponin = findDaysSinceReport('blood');

    // Rule 1: Active Chest Pain with no immediate Troponin
    if (recentSymptom && (recentSymptom.triageSeverity === 'EMERGENCY' || recentSymptom.triageSeverity === 'HIGH')) {
      if (daysSinceTroponin > 1) {
        recommendations.push({
          testName: 'High-Sensitivity Cardiac Troponin-I (hs-cTnI)',
          category: 'Biomarkers',
          priority: 'Urgent',
          aiRationale: 'Recent active chest pain/triage report logged without concurrent biomarker verification. Troponin test is critical to exclude acute myocardial necrosis.',
          clinicalGuidelineReference: '2023 ACC/AHA NSTE-ACS Guideline Rec 4.1 (Class I, Level A)',
          confidenceScore: 0.98,
        });
      }
      if (daysSinceEcg > 2) {
        recommendations.push({
          testName: '12-Lead Diagnostic Electrocardiogram (ECG)',
          category: 'Electrophysiology',
          priority: 'Urgent',
          aiRationale: 'Diagnostic 12-lead ECG required within acute window to rule out ST-segment shifts or silent ischemic vector changes.',
          clinicalGuidelineReference: '2023 ESC Acute Coronary Syndromes Guideline Sec 3.2',
          confidenceScore: 0.97,
        });
      }
    }

    // Rule 2: Chronic Hypertension or Palpitations with no recent ECG (> 90 days)
    if ((profile?.medicalHistory?.hasHypertension || recentSymptom?.structuredData?.palpitations) && daysSinceEcg > 90) {
      if (!recommendations.some((r) => r.testName.includes('ECG'))) {
        recommendations.push({
          testName: '12-Lead Resting Electrocardiogram (ECG)',
          category: 'Electrophysiology',
          priority: 'Routine',
          aiRationale: `Last ECG was ${daysSinceEcg === 999 ? 'never recorded' : `${daysSinceEcg} days ago`}. Regular electrophysiological assessment is indicated to monitor LV strain and conduction intervals.`,
          clinicalGuidelineReference: '2024 ESC Hypertension Guidelines (Class I, Level B)',
          confidenceScore: 0.92,
        });
      }
    }

    // Rule 3: Lipid Profile overdue (> 180 days) in cardiovascular risk profile
    if (daysSinceLipid > 180) {
      recommendations.push({
        testName: 'Fasting Comprehensive Lipid Profile with Direct LDL-C',
        category: 'Biomarkers',
        priority: 'Routine',
        aiRationale: `Lipid panel is overdue (${daysSinceLipid === 999 ? 'no prior record' : `${daysSinceLipid} days since last panel`}). Serial monitoring required to verify target LDL-C < 55-70 mg/dL.`,
        clinicalGuidelineReference: '2023 ACC/AHA Multisociety Cholesterol Guideline Rec 2.3',
        confidenceScore: 0.95,
      });
    }

    // Rule 4: Echocardiogram indicated for suspected HF, LVH, or heart disease history (> 365 days)
    if ((profile?.medicalHistory?.heartDiseases?.length || profile?.medicalHistory?.hasHypertension) && daysSinceEcho > 365) {
      recommendations.push({
        testName: 'Transthoracic 2D Echocardiography with Color Doppler',
        category: 'Imaging',
        priority: 'Elective',
        aiRationale: 'Surveillance echocardiogram recommended to evaluate ventricular chamber dimensions, LVEF, diastolic relaxation, and valvular morphology.',
        clinicalGuidelineReference: '2022 AHA/ACC/HFSA Heart Failure Guideline Sec 4.2',
        confidenceScore: 0.91,
      });
    }

    // Rule 5: Palpitations or suspected arrhythmia -> 24-Hour Holter
    if (recentSymptom?.structuredData?.palpitations || recentEcg?.abnormalities?.some((a) => a.toLowerCase().includes('brady') || a.toLowerCase().includes('tachy'))) {
      recommendations.push({
        testName: '24-Hour Ambulatory Holter ECG Monitoring',
        category: 'Electrophysiology',
        priority: 'Routine',
        aiRationale: 'Symptom report indicates episodic palpitations or rhythm variability. Extended ambulatory Holter monitoring is indicated to capture paroxysmal arrhythmias.',
        clinicalGuidelineReference: '2023 ACC/AHA Atrial Fibrillation Guideline Rec 5.1',
        confidenceScore: 0.93,
      });
    }

    return recommendations;
  }
}

export const investigationAgentInstance = new AdaptiveInvestigationEngine();

