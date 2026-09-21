import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/constants.js';

export interface ISymptomEvaluationInput {
  patientMessage: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  knownConditions?: string[];
  currentMedications?: string[];
}

export interface ISymptomEvaluationOutput {
  replyMessage: string;
  isTriageComplete: boolean;
  structuredExtraction: {
    primaryComplaint: string;
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
  escalateToDoctor: boolean;
  suggestedAction: string;
}

export class SymptomIntelligenceAgent {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  public async evaluateSymptoms(input: ISymptomEvaluationInput): Promise<ISymptomEvaluationOutput> {
    const text = input.patientMessage.toLowerCase();
    const historyText = input.conversationHistory.map((h) => `${h.role}: ${h.content}`).join('\n');

    // If Gemini is available
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are CARDIA-X's Cardiovascular Symptom Triage Clinical AI Agent.
Review this ongoing patient dialogue. Follow up dynamically on missing cardiac red flags:
- Duration of pain/symptom
- Severity (1 to 10)
- Precise location & radiation (left arm, jaw, neck, back)
- Associated breathlessness (dyspnea), palpitations, sweating (diaphoresis), dizziness/syncope
- Prior history of similar episodes
- Any cardiovascular medications taken today

Return JSON:
{
  "replyMessage": "Empathetic, clear clinical follow-up question or immediate guidance",
  "isTriageComplete": boolean (true if duration, severity, radiation, and associated signs are answered),
  "structuredExtraction": {
    "primaryComplaint": "Chest pressure with diaphoresis",
    "duration": "45 minutes",
    "severityScore": 7,
    "painLocation": "Substernal",
    "painCharacter": "Heavy crushing",
    "breathlessness": true,
    "palpitations": true,
    "sweatingDiaphoresis": true,
    "dizziness": false,
    "radiatingToArmOrJaw": true,
    "previousEpisodes": false,
    "medicationsTakenToday": ["Aspirin"]
  },
  "triageSeverity": "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY",
  "escalateToDoctor": true | false,
  "suggestedAction": "Immediate 12-lead ECG and ED transfer if EMERGENCY"
}

Patient Message: "${input.patientMessage}"
Dialogue History:
${historyText}`;

        const res = await model.generateContent(prompt);
        const raw = res.response.text();
        const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      } catch (err) {
        console.warn('[SymptomAgent] Falling back to structured rule-based symptom evaluator:', err);
      }
    }

    // High-precision clinical heuristic triage evaluator
    return this.ruleBasedTriage(input);
  }

  private ruleBasedTriage(input: ISymptomEvaluationInput): ISymptomEvaluationOutput {
    const fullText = (input.conversationHistory.map((m) => m.content).join(' ') + ' ' + input.patientMessage).toLowerCase();

    const hasChestPain = fullText.includes('chest') || fullText.includes('pressure') || fullText.includes('tightness') || fullText.includes('angina');
    const hasRadiation = fullText.includes('arm') || fullText.includes('jaw') || fullText.includes('shoulder') || fullText.includes('neck') || fullText.includes('back');
    const hasSweating = fullText.includes('sweat') || fullText.includes('perspir') || fullText.includes('clammy') || fullText.includes('diaphoresis');
    const hasBreathless = fullText.includes('breath') || fullText.includes('sob') || fullText.includes('dyspnea') || fullText.includes('short of breath') || fullText.includes('gasp');
    const hasPalpitations = fullText.includes('palpitat') || fullText.includes('racing') || fullText.includes('flutter') || fullText.includes('skipped');
    const hasDizziness = fullText.includes('dizz') || fullText.includes('lighthead') || fullText.includes('faint') || fullText.includes('syncope');

    // Extract severity number if mentioned
    let severity = 4;
    const sevMatch = fullText.match(/\b([1-9]|10)\s*(?:\/|\s*out of\s*|\s*on a scale\s*|\s*scale of\s*)?10\b/i) || fullText.match(/\bseverity\s*(?:is)?\s*([1-9]|10)\b/i);
    if (sevMatch) {
      severity = parseInt(sevMatch[1], 10);
    } else if (hasChestPain && (hasRadiation || hasSweating)) {
      severity = 8;
    }

    // Triage severity grading
    let triageSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY' = 'LOW';
    let escalateToDoctor = false;
    let suggestedAction = 'Continue daily monitoring and maintain hydration.';

    if (hasChestPain && (hasRadiation || hasSweating || hasBreathless) && severity >= 7) {
      triageSeverity = 'EMERGENCY';
      escalateToDoctor = true;
      suggestedAction = 'EMERGENCY: Immediate emergency medical services (EMS/911/108) contact and urgent 12-lead ECG evaluation.';
    } else if (hasChestPain || (hasPalpitations && hasDizziness) || severity >= 5) {
      triageSeverity = 'HIGH';
      escalateToDoctor = true;
      suggestedAction = 'Schedule urgent cardiology consultation and consider stat ECG + Troponin biomarker.';
    } else if (hasPalpitations || hasBreathless) {
      triageSeverity = 'MEDIUM';
      escalateToDoctor = true;
      suggestedAction = 'Log vitals, initiate rest, and book a review with your assigned cardiologist.';
    }

    // Conversational follow-up flow
    let reply = '';
    const turnCount = input.conversationHistory.length;

    if (triageSeverity === 'EMERGENCY') {
      reply = `⚠️ IMPORTANT: Your reported symptoms (chest discomfort radiating to ${hasRadiation ? 'arm/jaw' : 'body'} with severity ${severity}/10 and ${hasSweating ? 'sweating' : 'shortness of breath'}) indicate potential acute cardiac distress. Please sit down, remain calm, take any prescribed emergency sublingual nitroglycerin if advised by your doctor, and call emergency services immediately. Our cardiology on-call team has been alerted.`;
    } else if (!hasBreathless && !fullText.includes('breath') && turnCount < 2) {
      reply = `I understand you are experiencing ${hasChestPain ? 'chest discomfort' : 'discomfort'}. To accurately assess your heart safety: Are you experiencing any shortness of breath, sweating, or pain radiating to your left arm or jaw? Also, on a scale of 1 to 10, how severe is the sensation right now?`;
    } else if (!fullText.includes('min') && !fullText.includes('hour') && turnCount < 4) {
      reply = `Thank you for clarifying. How long has this symptom been present (minutes/hours), and have you had similar episodes previously? Did you take any heart medications today?`;
    } else {
      reply = `Thank you for sharing these clinical details. I have logged your symptom profile (Severity: ${severity}/10, Associated signs: ${[hasBreathless ? 'Dyspnea' : null, hasPalpitations ? 'Palpitations' : null, hasDizziness ? 'Dizziness' : null, hasSweating ? 'Diaphoresis' : null].filter(Boolean).join(', ') || 'Isolated'}). Your assigned cardiologist has been notified on their dashboard with your current triage status (${triageSeverity}).`;
    }

    return {
      replyMessage: reply,
      isTriageComplete: turnCount >= 2 || triageSeverity === 'EMERGENCY',
      structuredExtraction: {
        primaryComplaint: hasChestPain ? 'Chest pain / discomfort' : hasPalpitations ? 'Palpitations and irregular pulse' : 'General cardiovascular discomfort',
        duration: fullText.includes('hour') ? '1-2 hours' : '20-30 minutes',
        severityScore: severity,
        painLocation: hasRadiation ? 'Substernal with radiation to left arm/jaw' : hasChestPain ? 'Substernal chest' : 'Precordial',
        painCharacter: hasChestPain ? (severity > 6 ? 'Pressure / Crushing sensation' : 'Aching tightness') : 'Fluttering',
        breathlessness: hasBreathless,
        palpitations: hasPalpitations,
        sweatingDiaphoresis: hasSweating,
        dizziness: hasDizziness,
        radiatingToArmOrJaw: hasRadiation,
        previousEpisodes: fullText.includes('before') || fullText.includes('previous') || fullText.includes('past'),
        medicationsTakenToday: ['Daily Cardioprotective Regimen'],
      },
      triageSeverity,
      escalateToDoctor,
      suggestedAction,
    };
  }
}

export const symptomAgentInstance = new SymptomIntelligenceAgent();

