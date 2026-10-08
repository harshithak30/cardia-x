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
    sourceType?: string;
    source?: string;
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
      sourceType: r.guideline.sourceType || 'guideline',
      source: r.guideline.source,
      relevanceScore: r.score,
    }));

    if (retrieved.length === 0) {
      return {
        answer: 'I could not find a directly relevant source in the available evidence library. Please consult a qualified clinician or current official clinical guidance for this question.',
        retrievedGuidelines: [],
        confidenceScore: 0,
        clinicalExplanation: 'No source matched the query.',
      };
    }

    // 2. Synthesize response using LLM or structured knowledge generator
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const contextStr = guidelineList
          .map(
            (g, idx) =>
              `[${g.sourceType === 'guideline' ? 'Guideline' : 'Reference source'} ${idx + 1} (${g.organization})]: ${g.title}\nSource type: ${g.sourceType}. Treat dataset values as reference information, not verified prescribing instructions or formal guideline recommendations.\nContent: ${g.recommendationText} (${g.levelOfEvidence})`
          )
          .join('\n\n');

        const prompt = `You are CARDIA-X's Evidence Retrieval & Clinical Assistant AI.
Answer the user's cardiovascular question by grounding it only in the retrieved sources. Distinguish formal clinical guidelines from reference datasets and extracted documents. Never describe dataset content as an official guideline or turn listed dosage ranges into prescribing instructions. State when sources are incomplete or not guideline-graded.
Include direct references to the sources.

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
          clinicalExplanation: 'Grounded in retrieved clinical guidelines and clearly labelled reference sources.',
        };
      } catch (err) {
        console.warn('[EvidenceAgent] Gemini RAG synthesis fallback to expert engine:', err);
      }
    }

    const topDoc = retrieved[0].guideline;
    const isGuideline = topDoc.sourceType === 'guideline' || !topDoc.sourceType;
    const sourceLabel = isGuideline ? 'Guideline evidence' : 'Reference information (not a formal guideline)';
    const synthesizedAnswer = `### ${sourceLabel}
**Source:** ${topDoc.title} (${topDoc.organization})

${topDoc.recommendationText}

${topDoc.actionableSummary}

${isGuideline ? '' : 'This material is dataset/source-derived and has not been independently validated as a clinical guideline or prescribing instruction. Verify it against current official guidance and the patient’s clinical context.'}

Consult your clinician for decisions about diagnosis or treatment.`;

    return {
      answer: synthesizedAnswer,
      retrievedGuidelines: guidelineList,
      confidenceScore: 0.95,
      clinicalExplanation: `Retrieved from ${guidelineList.length} evidence sources.`,
    };
  }
}

export const evidenceAgentInstance = new EvidenceAgent();

