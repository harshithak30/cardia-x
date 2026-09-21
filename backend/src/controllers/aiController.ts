import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.js';
import { documentAgentInstance } from '../agents/DocumentAgent.js';
import { ecgAgentInstance } from '../agents/ECGAgent.js';
import { symptomAgentInstance } from '../agents/SymptomAgent.js';
import { evidenceAgentInstance } from '../agents/EvidenceAgent.js';
import { riskAgentInstance } from '../agents/RiskAgent.js';
import { careOrchestratorInstance } from '../agents/CareOrchestrator.js';
import { Symptom } from '../models/Symptom.js';
import { ChatHistory } from '../models/ChatHistory.js';
import { AIWorkflow } from '../models/AIWorkflow.js';
import { PatientProfile } from '../models/PatientProfile.js';
import { WearableMetric } from '../models/WearableMetric.js';
import { ECGRecord } from '../models/ECGRecord.js';
import { MedicalReport } from '../models/MedicalReport.js';

export const handleSymptomChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user!.userId);
    const { message, conversationId, history } = req.body;

    const evaluation = await symptomAgentInstance.evaluateSymptoms({
      patientMessage: message,
      conversationHistory: history || [],
    });

    // Save symptom record if complete or high severity
    if (evaluation.isTriageComplete || evaluation.triageSeverity === 'HIGH' || evaluation.triageSeverity === 'EMERGENCY') {
      const symptomDoc = await Symptom.create({
        patientId,
        reportedAt: new Date(),
        primaryComplaint: evaluation.structuredExtraction.primaryComplaint,
        structuredData: evaluation.structuredExtraction,
        conversationTranscript: [
          ...(history || []),
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: evaluation.replyMessage, timestamp: new Date() },
        ],
        triageSeverity: evaluation.triageSeverity,
        aiRecommendation: evaluation.suggestedAction,
        escalatedToDoctor: evaluation.escalateToDoctor,
      });

      await careOrchestratorInstance.updatePatientWorldModel(
        patientId,
        'SYMPTOM_REPORTED',
        `Symptom Reported: ${evaluation.structuredExtraction.primaryComplaint}`,
        `Severity ${evaluation.structuredExtraction.severityScore}/10 (${evaluation.triageSeverity}). Action: ${evaluation.suggestedAction}`,
        'Symptom',
        evaluation.triageSeverity === 'EMERGENCY' || evaluation.triageSeverity === 'HIGH' ? 'critical' : 'moderate',
        { symptomId: symptomDoc._id }
      );
    }

    res.json({
      success: true,
      reply: evaluation.replyMessage,
      triage: evaluation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleEvidenceChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user!.userId);
    const { query, sessionId } = req.body;

    const profile = await PatientProfile.findOne({ userId: patientId });
    const contextSummary = profile
      ? `Patient: Age ${profile.age || 50}, Sex: ${profile.gender}, Risk: ${profile.overallRiskLevel}, Known conditions: ${profile.medicalHistory?.heartDiseases?.join(', ') || 'None'}`
      : undefined;

    const result = await evidenceAgentInstance.consultCardiovascularKnowledge(query, contextSummary);

    // Persist in chat history
    let chat = sessionId ? await ChatHistory.findById(sessionId) : null;
    if (!chat) {
      chat = new ChatHistory({
        patientId,
        sessionTitle: query.slice(0, 40) + '...',
        messages: [],
      });
    }

    chat.messages.push({
      role: 'user',
      content: query,
      timestamp: new Date(),
    });

    chat.messages.push({
      role: 'assistant',
      content: result.answer,
      timestamp: new Date(),
      retrievedGuidelines: result.retrievedGuidelines,
      confidenceScore: result.confidenceScore,
    });

    chat.lastActivity = new Date();
    await chat.save();

    res.json({
      success: true,
      sessionId: chat._id,
      answer: result.answer,
      retrievedGuidelines: result.retrievedGuidelines,
      confidenceScore: result.confidenceScore,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user!.userId);
    const history = await ChatHistory.find({ patientId }).sort({ lastActivity: -1 });
    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const analyzeManualEcg = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user!.userId);
    const { heartRateBpm, prIntervalMs, qrsDurationMs, qtIntervalMs, rhythm, stSegmentChanges } = req.body;

    const previousEcg = await ECGRecord.findOne({ patientId }).sort({ recordDate: -1 });
    const analysis = ecgAgentInstance.analyzeECG({
      heartRateBpm: Number(heartRateBpm),
      prIntervalMs: Number(prIntervalMs),
      qrsDurationMs: Number(qrsDurationMs),
      qtIntervalMs: Number(qtIntervalMs),
      rhythm,
      stSegmentChanges,
      previousEcg,
    });

    const record = await ECGRecord.create({
      patientId,
      recordDate: new Date(),
      leadsCount: 12,
      ...analysis,
    });

    await careOrchestratorInstance.updatePatientWorldModel(
      patientId,
      'ECG_UPLOADED',
      `Manual ECG Analysis Logged (${analysis.rhythm})`,
      analysis.aiInterpretation,
      'ECG',
      analysis.baselineComparison.isDeteriorating ? 'critical' : 'normal',
      { ecgId: record._id }
    );

    res.status(201).json({ success: true, record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

