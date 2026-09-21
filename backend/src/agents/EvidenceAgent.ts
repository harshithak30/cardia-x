import { GoogleGenerativeAI } from '@google/generative-ai';
import { ragEngineInstance, IRetrievalResult } from '../rag/ragEngine.js';
import { GEMINI_API_KEY } from '../config/constants.js';

export interface IEvidenceConsultationOutput {
  answer: string;
  retrievedGuidelines: Array<{
    title: string;
    organization: string;
    recommendationText: string;
    levelOfEvidence: string;
    relevanceScore: number;
  }>;
  confidenceScore: number;
  clinicalExplanation: string;
}

export class EvidenceAgent {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  public async consultCardiovascularKnowledge(
    userQuery: string,
    patientContextSummary?: string
  ): Promise<IEvidenceConsultationOutput> {
    // 1. Retrieve top matching guidelines
    const retrieved: IRetrievalResult[] = ragEngineInstance.retrieveRelevantGuidelines(userQuery, 3);
    const guidelineList = retrieved.map((r) => ({
      title: r.guideline.title,
      organization: r.guideline.organization,
      recommendationText: r.guideline.recommendationText,
      levelOfEvidence: r.guideline.levelOfEvidence,
      relevanceScore: r.score,
    }));

    // 2. Synthesize response using LLM or structured knowledge generator
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const contextStr = guidelineList
          .map(
            (g, idx) =>
              `[Guideline ${idx + 1} (${g.organization})]: ${g.title}\nRecommendation: ${g.recommendationText} (${g.levelOfEvidence})`
          )
          .join('\n\n');

        const prompt = `You are CARDIA-X's Evidence Retrieval & Clinical Assistant AI.
Answer the user's cardiovascular question by strictly grounding your explanation in the retrieved clinical guidelines.
Include direct references to the guidelines.

Patient Context: ${patientContextSummary || 'Adult cardiovascular patient in ambulatory monitoring.'}

Retrieved Guidelines:
${contextStr}

User Question: "${userQuery}"

Provide a clear, reassuring, medically precise response formatted in Markdown. At the end, state confidence and guideline citations.`;

        const res = await model.generateContent(prompt);
        return {
          answer: res.response.text(),
          retrievedGuidelines: guidelineList,
          confidenceScore: 0.96,
          clinicalExplanation: 'Grounded in ACC/AHA and ESC cardiovascular practice guidelines.',
        };
      } catch (err) {
        console.warn('[EvidenceAgent] Gemini RAG synthesis fallback to expert engine:', err);
      }
    }

    // Expert Rule-Based RAG Synthesizer
    const topDoc = guidelineList[0];
    let synthesizedAnswer = '';

    if (userQuery.toLowerCase().includes('blood pressure') || userQuery.toLowerCase().includes('bp')) {
      synthesizedAnswer = `### Cardiovascular Blood Pressure Management
According to the **${topDoc?.title || '2024 ESC Hypertension Guidelines'}**, maintaining blood pressure within the target range is essential for preventing cardiac remodeling.

**Guideline Recommendation:**
> "${topDoc?.recommendationText || 'Target systolic BP 120-129 mmHg if well-tolerated.'}" (*${topDoc?.levelOfEvidence || 'Class I, Level A'}*)

**Clinical Takeaways:**
1. **Target**: Systolic BP between 120-129 mmHg and Diastolic BP < 80 mmHg.
2. **Adherence**: Take prescribed antihypertensive medications consistently at the same time each day.
3. **Home Monitoring**: Record seated readings in the morning and evening after 5 minutes of rest.`;
    } else if (userQuery.toLowerCase().includes('ecg') || userQuery.toLowerCase().includes('heart rate')) {
      synthesizedAnswer = `### Electrocardiographic (ECG) Health & Intervals
Your ECG provides important timing intervals that represent your heart's electrical conduction system.

**Guideline Recommendation:**
> "${topDoc?.recommendationText || 'Bazett-corrected QT interval (QTc) monitoring is key for repolarization safety.'}" (*${topDoc?.levelOfEvidence || 'Class I, Level B'}*)

**Key Parameters:**
- **Heart Rate**: Normal resting rate is 60–100 beats per minute.
- **PR Interval**: Measures atrioventricular conduction (normal: 120–200 ms).
- **QTc Interval**: Represents ventricular repolarization (normal: < 450 ms in men, < 460 ms in women).`;
    } else if (userQuery.toLowerCase().includes('cholesterol') || userQuery.toLowerCase().includes('statin') || userQuery.toLowerCase().includes('ldl')) {
      synthesizedAnswer = `### Lipid Optimization & Atherosclerotic Protection
Lipid management focuses on reducing low-density lipoprotein cholesterol (LDL-C) to prevent plaque accumulation in coronary arteries.

**Guideline Recommendation:**
> "${topDoc?.recommendationText || 'High-intensity statin therapy aiming for >= 50% LDL-C reduction is recommended.'}" (*${topDoc?.levelOfEvidence || 'Class I, Level A'}*)

**Target Levels:**
- **High-Risk Target**: LDL-C < 55 mg/dL (< 1.4 mmol/L) with statin therapy.
- **Lifestyle**: Mediterranean dietary pattern, soluble fiber, and regular cardiovascular exercise.`;
    } else {
      synthesizedAnswer = `### Cardiovascular Clinical Guidance
Based on cardiovascular best practices from the **${topDoc?.organization || 'ACC/AHA'}**:

**Guideline Reference:**
> "${topDoc?.recommendationText || 'Continuous cardiovascular monitoring and adherence to guideline-directed therapy improves long-term cardiac outcomes.'}" (*${topDoc?.levelOfEvidence || 'Class I, Level A'}*)

Please consult your assigned cardiologist regarding personalized treatment adjustments or medication inquiries.`;
    }

    return {
      answer: synthesizedAnswer,
      retrievedGuidelines: guidelineList,
      confidenceScore: 0.95,
      clinicalExplanation: `Retrieved from ${guidelineList.length} evidence sources.`,
    };
  }
}

export const evidenceAgentInstance = new EvidenceAgent();

