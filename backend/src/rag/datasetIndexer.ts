import fs from 'fs/promises';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { unzipSync } from 'fflate';
import { PDFParse } from 'pdf-parse';
import { ragEngineInstance } from './ragEngine.js';
import { IGuidelineDocument } from './guidelines.js';

const DATASET_DIR = path.resolve(process.cwd(), 'dataset');
const MAX_CHUNK_LENGTH = 1800;
const MEDICATION_DATASET = 'comprehensive_cardiovascular_medication_knowledge_base.xlsx';
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
});

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

  return {
    id: `DATASET-${index + 1}`,
    organization: 'Source document',
    title: `${title} [source extract]`,
    topic: 'Uploaded cardiovascular clinical knowledge',
    keywords: tokenize(chunk),
    recommendationText: chunk,
    levelOfEvidence: 'Not independently graded from extracted passage',
    actionableSummary: 'Extracted from a source document; verify the original context and current guideline before clinical use.',
    sourceType: 'source_document',
    source,
  };
};

const readMedicationDataset = async (): Promise<IGuidelineDocument[]> => {
  const source = path.join(DATASET_DIR, MEDICATION_DATASET);
  const archive = unzipSync(new Uint8Array(await fs.readFile(source)));
  const sharedStringDocument = archive['xl/sharedStrings.xml']
    ? xmlParser.parse(new TextDecoder().decode(archive['xl/sharedStrings.xml']))
    : null;
  const sharedStringRows = sharedStringDocument?.sst?.si
    ? Array.isArray(sharedStringDocument.sst.si)
      ? sharedStringDocument.sst.si
      : [sharedStringDocument.sst.si]
    : [];
  const sharedStrings = sharedStringRows.map((item: any) => {
    if (typeof item.t === 'string') return item.t;
    const runs = Array.isArray(item.r) ? item.r : item.r ? [item.r] : [];
    return runs.map((run: any) => run.t || '').join('');
  });

  const worksheetXml = archive['xl/worksheets/sheet1.xml'];
  if (!worksheetXml) return [];

  const worksheet = xmlParser.parse(new TextDecoder().decode(worksheetXml));
  const rowItems = worksheet.worksheet?.sheetData?.row;
  const rows = Array.isArray(rowItems) ? rowItems : rowItems ? [rowItems] : [];
  const decodeCell = (cell: any): string => {
    if (cell['@_t'] === 's') return sharedStrings[Number(cell.v)] || '';
    if (cell['@_t'] === 'inlineStr') {
      const inline = cell.is?.t;
      return typeof inline === 'string' ? inline : inline?.['#text'] || '';
    }
    const value = cell.v;
    return value == null ? '' : String(value);
  };
  const readRow = (row: any): string[] => {
    const cells = Array.isArray(row.c) ? row.c : row.c ? [row.c] : [];
    const values: string[] = [];
    for (const cell of cells) {
      const address = String(cell['@_r'] || '').match(/^[A-Z]+/i)?.[0];
      if (!address) continue;
      let column = 0;
      for (const letter of address.toUpperCase()) column = column * 26 + letter.charCodeAt(0) - 64;
      values[column - 1] = decodeCell(cell).trim();
    }
    return values;
  };

  const headers = readRow(rows[0] || {});
  const headerIndex = new Map(headers.map((value, index) => [value, index]));
  const readCell = (row: string[], header: string): string => row[headerIndex.get(header) ?? -1] || '';

  const documents: IGuidelineDocument[] = [];
  for (const rowItem of rows.slice(1)) {
    const row = readRow(rowItem);
    const drugId = readCell(row, 'Drug_ID');
    const drugName = readCell(row, 'Drug_Name');
    if (!drugId || !drugName) continue;

    const drugClass = readCell(row, 'Drug_Class');
    const indication = readCell(row, 'Primary_Indication');
    const dosage = readCell(row, 'Standard_Dosage');
    const contraindications = readCell(row, 'Major_Contraindications');
    const monitoring = readCell(row, 'Monitoring_Parameters');
    const clinicalPearl = readCell(row, 'Clinical_Pearl');
    const sourceEvidenceLabel = readCell(row, 'Evidence_Level');
    const content = [
      `Drug: ${drugName}`,
      `Class: ${drugClass}`,
      `Indication in source dataset: ${indication}`,
      `Dosage range listed in source dataset (not a prescription): ${dosage}`,
      `Contraindications listed in source dataset: ${contraindications}`,
      `Monitoring listed in source dataset: ${monitoring}`,
      `Clinical note in source dataset: ${clinicalPearl}`,
      `Source workbook evidence label (not independently verified): ${sourceEvidenceLabel}`,
    ].join('\n');

    documents.push({
      id: `MED-REF-${drugId}`,
      organization: 'CARDIA-X medication dataset',
      title: `${drugName} medication reference`,
      topic: `${drugClass} medication reference and safety monitoring`,
      keywords: tokenize(`${drugName} ${drugClass} ${indication} ${contraindications} ${monitoring}`),
      recommendationText: content,
      levelOfEvidence: 'Reference dataset; not guideline-graded',
      actionableSummary: 'Reference information only. Do not use the listed dosage as a prescribing instruction; verify current official labeling, patient factors, and clinician judgment.',
      sourceType: 'reference_dataset',
      source: MEDICATION_DATASET,
    });
  }

  return documents;
};

export const indexClinicalDatasets = async (): Promise<number> => {
  let files: string[];
  try {
    files = await fs.readdir(DATASET_DIR);
  } catch {
    return 0;
  }

  let indexed = 0;
  for (const file of files.filter((name) => name.toLowerCase().endsWith('.pdf'))) {
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

  if (files.includes(MEDICATION_DATASET)) {
    const medicationReferences = await readMedicationDataset();
    medicationReferences.forEach((document) => ragEngineInstance.addGuideline(document));
    indexed += medicationReferences.length;
    console.log(`[Dataset] Indexed ${medicationReferences.length} non-guideline medication references from ${MEDICATION_DATASET}.`);
  }

  const excludedWorkbooks = files.filter((file) => file.toLowerCase().endsWith('.xlsx') && file !== MEDICATION_DATASET);
  if (excludedWorkbooks.length) {
    console.log(`[Dataset] Kept ${excludedWorkbooks.length} synthetic/research workbooks out of clinical guideline retrieval.`);
  }

  return indexed;
};