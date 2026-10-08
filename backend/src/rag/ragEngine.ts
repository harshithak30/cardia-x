import { CARDIOVASCULAR_GUIDELINES, IGuidelineDocument } from './guidelines.js';

export interface IRetrievalResult {
  guideline: IGuidelineDocument;
  score: number;
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class RAGEngine {
  private guidelines: IGuidelineDocument[] = CARDIOVASCULAR_GUIDELINES;

  public retrieveRelevantGuidelines(query: string, topK: number = 3): IRetrievalResult[] {
    const queryTokens = query.toLowerCase().split(/[\s,.;:!?()/-]+/).filter((t) => t.length > 2);
    
    const scored = this.guidelines.map((doc) => {
      let score = 0;
      const combinedDocText = `${doc.title} ${doc.topic} ${doc.keywords.join(' ')} ${doc.recommendationText} ${doc.actionableSummary}`.toLowerCase();
      
      // Keyword matching & weighting
      queryTokens.forEach((token) => {
        const tokenPattern = new RegExp(`\\b${escapeRegExp(token)}\\b`, 'i');
        // Keyword exact match in keyword tags has highest weight
        if (doc.keywords.some((kw) => kw.toLowerCase().split(/[\\s/-]+/).includes(token))) {
          score += 3.5;
        }
        if (tokenPattern.test(doc.topic)) {
          score += 2.5;
        }
        if (tokenPattern.test(doc.title)) {
          score += 2.0;
        }
        // Substring occurrences in recommendation text
        const regex = new RegExp(`\\b${escapeRegExp(token)}\\b`, 'gi');
        const matches = combinedDocText.match(regex);
        if (matches) {
          score += matches.length * 1.0;
        }
      });

      // Normalize score between 0.0 and 1.0
      const normalizedScore = Math.min(parseFloat((score / (queryTokens.length * 4 + 0.1)).toFixed(2)), 0.99);

      return {
        guideline: doc,
        score: normalizedScore,
      };
    });

    // Sort descending
    scored.sort((a, b) => b.score - a.score);
    return scored.filter((result) => result.score > 0).slice(0, topK);
  }

  public addGuideline(doc: IGuidelineDocument): void {
    this.guidelines.push(doc);
  }

  public getAllGuidelines(): IGuidelineDocument[] {
    return this.guidelines;
  }
}

export const ragEngineInstance = new RAGEngine();

