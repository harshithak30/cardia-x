import fs from 'fs/promises';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { ragEngineInstance } from './ragEngine.js';
import { IGuidelineDocument } from './guidelines.js';

const DATASET_DIR = path.resolve(process.cwd(), 'dataset');
const MAX_CHUNK_LENGTH = 1800;

const tokenize = (text: string): string[] =>
  [...new Set(text.toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) || [])].slice(0, 24);

const splitIntoChunks = (text: string): string[] => {
  const paragraphs = text
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter((paragraph) => paragraph.length > 80);

  const chunks: string[] = [];
  let current = '';
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 1 > MAX_CHUNK_LENGTH) {
      chunks.push(current);
      current = '';
    }
    current = current ? `${current} ${paragraph}` : paragraph;
  }
  if (current) chunks.push(current);
  return chunks;
};

const toGuideline = (chunk: string, index: number, source: string): IGuidelineDocument => {
  const title = chunk.slice(0, 140).replace(/[.:;].*$/, '').trim() || `Dataset evidence ${index + 1}`;
  const levelOfEvidence = chunk.match(/class\s+(i{1,3}|iv)\b/i)
    ? 'Class I (Level B)'
    : 'Class IIa (Level B)';

  return {
    id: `DATASET-${index + 1}`,
    organization: 'ACC/AHA',
    title,
    topic: 'Uploaded cardiovascular clinical knowledge',
    keywords: tokenize(chunk),
    recommendationText: chunk,
    levelOfEvidence,
    actionableSummary: 'Evidence extracted from the uploaded clinical dataset. Verify applicability before clinical use.',
    source,
  };
};

export const indexClinicalDatasets = async (): Promise<number> => {
  let files: string[];
  try {
    files = (await fs.readdir(DATASET_DIR)).filter((file) => file.toLowerCase().endsWith('.pdf'));
  } catch {
    return 0;
  }

  let indexed = 0;
  for (const file of files) {
    const source = path.join(DATASET_DIR, file);
    const parser = new PDFParse({ data: await fs.readFile(source) });
    try {
      const result = await parser.getText();
      const chunks = splitIntoChunks(result.text);
      chunks.forEach((chunk, index) => {
        ragEngineInstance.addGuideline(toGuideline(chunk, index, file));
      });
      indexed += chunks.length;
      console.log(`[Dataset] Indexed ${chunks.length} evidence chunks from ${file}.`);
    } finally {
      await parser.destroy();
    }
  }

  return indexed;
};