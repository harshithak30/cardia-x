import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { documentAgentInstance } from './DocumentAgent.js';
import { ecgAgentInstance } from './ECGAgent.js';
import { medicationAgentInstance } from './MedicationAgent.js';
import { symptomAgentInstance } from './SymptomAgent.js';
import { riskAgentInstance } from './RiskAgent.js';
import { investigationAgentInstance } from './InvestigationAgent.js';
import { evidenceAgentInstance } from './EvidenceAgent.js';
import { safetyAgentInstance } from './SafetyAgent.js';
import { PatientWorldModel } from '../models/PatientWorldModel.js';
import { AIWorkflow, IAgentTrace } from '../models/AIWorkflow.js';
import { Notification } from '../models/Notification.js';
import { PatientProfile } from '../models/PatientProfile.js';
import { WearableMetric } from '../models/WearableMetric.js';
import { ECGRecord } from '../models/ECGRecord.js';
import { MedicalReport } from '../models/MedicalReport.js';
import { Symptom } from '../models/Symptom.js';
import { Medication } from '../models/Medication.js';
import { Investigation } from '../models/Investigation.js';
import { RiskAssessment } from '../models/RiskAssessment.js';
import { AuditLog } from '../models/AuditLog.js';

export class CareOrchestratorAgent {
  public async handleNewReportUploaded(
    patientId: mongoose.Types.ObjectId,
    rawText: string,
    fileType: string,
    fileName: string,
    fileUrl: string,
    fileSize: number
  ) {
    const workflowId = uuidv4();
    const traces: IAgentTrace[] = [];
    const startTime = Date.now();

    // 1. Document Intelligence Agent
    const docTraceStart = Date.now();
    const extraction = await documentAgentInstance.processDocument(rawText, fileType, fileName);
    traces.push({
      agentName: 'DocumentIntelligenceAgent',
      action: 'OCR & Multimodal Entity Extraction',
      inputSummary: `File: ${fileName} (${fileType})`,
      outputSummary: `Extracted ${extraction.reportType} with ${extraction.labValues.length} lab values and ${extraction.medications.length} meds.`,
      confidenceScore: extraction.confidenceScore,
      durationMs: Date.now() - docTraceStart,
      timestamp: new Date(),
    });

    // Save Medical Report
    const report = await MedicalReport.create({
      patientId,
      reportType: extraction.reportType,
      title: extraction.title || fileName,
      fileUrl,
      fileType,
      fileSize,
      reportDate: extraction.reportDate ? new Date(extraction.reportDate) : new Date(),
      doctorName: extraction.doctorName,
      hospitalName: extraction.hospitalName,
      extractedRawText: rawText,
      extractedData: extraction,
      confirmedByPatient: true,
      status: 'extracted',
    });

    // 2. If ECG report, trigger ECG Analysis Agent
    let createdEcg = null;
    if (extraction.reportType === 'ECG' || extraction.ecgFindings) {
      const ecgTraceStart = Date.now();
      const previousEcg = await ECGRecord.findOne({ patientId }).sort({ recordDate: -1 });
      
      const ecgAnalysis = ecgAgentInstance.analyzeECG({
        heartRateBpm: extraction.ecgFindings?.heartRateBpm || 72,
        prIntervalMs: extraction.ecgFindings?.prIntervalMs || 160,
        qrsDurationMs: extraction.ecgFindings?.qrsDurationMs || 90,
        qtIntervalMs: extraction.ecgFindings?.qtIntervalMs || 400,
        rhythm: extraction.ecgFindings?.rhythm,
        stSegmentChanges: extraction.ecgFindings?.stSegmentChanges,
        abnormalitiesDetected: extraction.ecgFindings?.abnormalitiesDetected,
        previousEcg,
      });

      traces.push({
        agentName: 'ECGAnalysisAgent',
        action: 'Waveform & Rhythm Longitudinal Analysis',
        inputSummary: `Heart Rate: ${ecgAnalysis.heartRateBpm} bpm, QTc: ${ecgAnalysis.qtcIntervalMs} ms`,
        outputSummary: `Rhythm: ${ecgAnalysis.rhythm}, Delta: ${ecgAnalysis.baselineComparison.deltaNotes}`,
        confidenceScore: 0.95,
        durationMs: Date.now() - ecgTraceStart,
        timestamp: new Date(),
      });

      createdEcg = await ECGRecord.create({
        patientId,
        reportId: report._id,
        recordDate: report.reportDate,
        leadsCount: 12,
        measurementsAvailable: extraction.ecgFindings?.measurementsAvailable ?? false,
        ...ecgAnalysis,
      });
    }

    // 3. If Prescription, trigger Medication Agent
    if (extraction.medications && extraction.medications.length > 0) {
      const medTraceStart = Date.now();
      const existingMeds = await Medication.find({ patientId, isActive: true });
      
      for (const med of extraction.medications) {
        const duplicateWarning = medicationAgentInstance.detectDuplicates(existingMeds, med.name);
        const interactions = medicationAgentInstance.checkInteractions([...existingMeds.map((m) => m.name), med.name]);

        await Medication.create({
          patientId,
          name: med.name,
          dosage: med.dosage || 'Standard Dose',
          frequency: med.frequency || 'Once daily',
          timing: { morning: true, afternoon: false, evening: false, night: med.frequency?.toLowerCase().includes('night') || false },
          extractedFromReportId: report._id,
          isActive: true,
          duplicateWarning: duplicateWarning || undefined,
          potentialInteractions: interactions.map((i) => i.description),
        });
      }

      traces.push({
        agentName: 'MedicationAgent',
        action: 'Prescription Ingestion & Interaction Validation',
        inputSummary: `Extracted ${extraction.medications.length} medications`,
        outputSummary: 'Cross-referenced drug classes and checked adverse interaction matrix.',
        confidenceScore: 0.97,
        durationMs: Date.now() - medTraceStart,
        timestamp: new Date(),
      });
    }

    // 4. Trigger Longitudinal Risk Agent & Investigation Engine
    const profile = await PatientProfile.findOne({ userId: patientId });
    const latestVitals = await WearableMetric.findOne({ patientId }).sort({ timestamp: -1 });
    const latestSymptom = await Symptom.findOne({ patientId }).sort({ reportedAt: -1 });

    const riskTraceStart = Date.now();
    const riskResult = riskAgentInstance.calculateRisk(profile, latestVitals, createdEcg, latestSymptom);
    traces.push({
      agentName: 'RiskMonitoringAgent',
      action: 'Cardiovascular Risk Stratification & Trend Calculation',
      inputSummary: `Vitals & History analyzed`,
      outputSummary: `Assessed Level: ${riskResult.overallRiskLevel} (Score: ${riskResult.riskScore}/100)`,
      confidenceScore: riskResult.confidenceScore,
      durationMs: Date.now() - riskTraceStart,
      timestamp: new Date(),
    });

    const riskAssessment = await RiskAssessment.create({
      patientId,
      overallRiskLevel: riskResult.overallRiskLevel,
      riskScore: riskResult.riskScore,
      confidenceScore: riskResult.confidenceScore,
      keyRiskDrivers: riskResult.keyRiskDrivers,
      framinghamScore10Yr: riskResult.framinghamScore10Yr,
      ascvdScore: riskResult.ascvdScore,
      deteriorationDetected: riskResult.deteriorationDetected,
      deteriorationReason: riskResult.deteriorationReason,
      recommendedActions: riskResult.recommendedActions,
      approvalRequired: riskResult.approvalRequired,
      approvalStatus: riskResult.approvalRequired ? 'pending_approval' : 'auto_processed',
    });

    // 5. Adaptive Investigation Engine
    const investTraceStart = Date.now();
    const allReports = await MedicalReport.find({ patientId }).sort({ reportDate: -1 });
    const investigationsNeeded = investigationAgentInstance.determineRequiredInvestigations(
      profile,
      allReports,
      createdEcg,
      latestSymptom
    );

    for (const inv of investigationsNeeded) {
      await Investigation.create({
        patientId,
        testName: inv.testName,
        category: inv.category,
        priority: inv.priority,
        aiRationale: inv.aiRationale,
        clinicalGuidelineReference: inv.clinicalGuidelineReference,
        confidenceScore: inv.confidenceScore,
        status: 'recommended_by_ai',
      });
    }

    traces.push({
      agentName: 'InvestigationAgent',
      action: 'Diagnostic Gap Analysis',
      inputSummary: `Evaluated ${allReports.length} past reports`,
      outputSummary: `Generated ${investigationsNeeded.length} clinical recommendations.`,
      confidenceScore: 0.94,
      durationMs: Date.now() - investTraceStart,
      timestamp: new Date(),
    });

    // 6. Safety Agent Guardrail Check
    const safetyTraceStart = Date.now();
    const safetyCheck = safetyAgentInstance.validateAction({
      actionType: 'routine_notification',
      riskTier: riskResult.overallRiskLevel,
      proposedChange: `Update patient cardiovascular baseline and notify on ${extraction.reportType}`,
      confidenceScore: riskResult.confidenceScore,
    });

    traces.push({
      agentName: 'SafetyAgent',
      action: 'Clinician-in-the-Loop Verification Gate',
      inputSummary: `Risk tier: ${riskResult.overallRiskLevel}`,
      outputSummary: `Safety Decision: ${safetyCheck.safetyTier} (${safetyCheck.safetyRationale})`,
      confidenceScore: 0.99,
      durationMs: Date.now() - safetyTraceStart,
      timestamp: new Date(),
    });

    // 7. Update Cardiovascular Patient World Model
    await this.updatePatientWorldModel(
      patientId,
      'REPORT_UPLOADED',
      `New ${extraction.reportType} Uploaded: ${report.title}`,
      extraction.aiSummary,
      extraction.reportType === 'ECG' ? 'ECG' : 'Lab',
      riskResult.overallRiskLevel === 'HIGH' ? 'critical' : 'normal',
      { reportId: report._id, riskScore: riskResult.riskScore }
    );

    // 8. Log AI Workflow execution
    await AIWorkflow.create({
      workflowId,
      patientId,
      initiator: 'CareOrchestrator',
      triggerEvent: `REPORT_UPLOADED (${extraction.reportType})`,
      agentTraces: traces,
      safetyCheck: {
        passed: safetyCheck.isSafeToExecute,
        reason: safetyCheck.safetyRationale,
        riskTier: riskResult.overallRiskLevel,
        requiresHumanReview: safetyCheck.requiresDoctorApproval,
      },
      finalOutput: `Document successfully processed and patient world model synchronized. Overall risk: ${riskResult.overallRiskLevel}.`,
      status: safetyCheck.requiresDoctorApproval ? 'awaiting_doctor' : 'completed',
    });

    // 9. Dispatch Notifications
    await Notification.create({
      recipientUserId: patientId,
      role: 'patient',
      category: 'investigation',
      title: `${extraction.reportType} Processed`,
      message: `Your report "${report.title}" was analyzed by CARDIA-X AI Document Intelligence.`,
      severity: 'info',
      actionUrl: `/patient/reports`,
    });

    if (riskResult.overallRiskLevel === 'HIGH' && profile?.assignedDoctorId) {
      await Notification.create({
        recipientUserId: profile.assignedDoctorId,
        role: 'doctor',
        category: 'doctor_alert',
        title: 'High Risk Alert: Patient Report Requires Review',
        message: `High risk indicators detected on patient file for ${profile.userId}.`,
        severity: 'critical',
        actionUrl: `/doctor/patients/${patientId}`,
      });
    }

    return {
      report,
      createdEcg,
      riskAssessment,
      investigationsNeeded,
      workflowId,
    };
  }

  public async updatePatientWorldModel(
    patientId: mongoose.Types.ObjectId,
    eventType: string,
    title: string,
    summary: string,
    category: 'ECG' | 'Lab' | 'Medication' | 'Symptom' | 'Vitals' | 'Doctor' | 'Investigation' | 'Alert',
    severity: 'normal' | 'moderate' | 'critical' = 'normal',
    metadata?: any
  ) {
    let worldModel = await PatientWorldModel.findOne({ patientId });
    if (!worldModel) {
      worldModel = await PatientWorldModel.create({
        patientId,
        timeline: [],
        totalEventsCount: 0,
      });
    }

    const newEvent = {
      id: uuidv4(),
      eventType,
      timestamp: new Date(),
      title,
      summary,
      category,
      severity,
      metadata,
    };

    worldModel.timeline.unshift(newEvent);
    worldModel.totalEventsCount = worldModel.timeline.length;
    worldModel.lastUpdated = new Date();

    // Update Profile current health score and risk level
    const profile = await PatientProfile.findOne({ userId: patientId });
    if (profile) {
      if (severity === 'critical') {
        profile.overallRiskLevel = 'HIGH';
        profile.currentHealthScore = Math.max(profile.currentHealthScore - 15, 35);
      } else if (severity === 'moderate') {
        profile.currentHealthScore = Math.max(profile.currentHealthScore - 5, 55);
      }
      await profile.save();
    }

    await worldModel.save();
    return worldModel;
  }
}

export const careOrchestratorInstance = new CareOrchestratorAgent();

