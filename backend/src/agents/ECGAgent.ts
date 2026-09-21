import { IECGRecord } from '../models/ECGRecord.js';

export interface IECGAnalysisInput {
  heartRateBpm: number;
  prIntervalMs?: number;
  qrsDurationMs?: number;
  qtIntervalMs?: number;
  rhythm?: string;
  stSegmentChanges?: string;
  abnormalitiesDetected?: string[];
  previousEcg?: IECGRecord | null;
}

export interface IECGAnalysisOutput {
  heartRateBpm: number;
  prIntervalMs: number;
  qrsDurationMs: number;
  qtIntervalMs: number;
  qtcIntervalMs: number;
  rhythm: string;
  axis: string;
  stSegment: string;
  abnormalities: string[];
  aiInterpretation: string;
  baselineComparison: {
    previousEcgId?: any;
    previousDate?: Date;
    changesDetected: string[];
    isDeteriorating: boolean;
    deltaNotes: string;
  };
  waveformPoints: number[];
}

export class ECGAgent {
  /**
   * Generates realistic P-Q-R-S-T synthetic cardiac waveform data points
   */
  public generateWaveformPoints(heartRateBpm: number = 72, isAbnormal: boolean = false): number[] {
    const points: number[] = [];
    const sampleRate = 100; // 100 samples per second
    const cycleDurationSeconds = 60 / Math.max(heartRateBpm, 40);
    const totalSamples = Math.round(cycleDurationSeconds * sampleRate * 3); // 3 full cycles

    for (let i = 0; i < totalSamples; i++) {
      const t = (i % Math.round(cycleDurationSeconds * sampleRate)) / (cycleDurationSeconds * sampleRate);
      let val = 0;

      // P wave (at t = 0.15)
      if (t >= 0.10 && t <= 0.20) {
        val += 0.15 * Math.sin(((t - 0.10) / 0.10) * Math.PI);
      }
      // PR segment baseline (t = 0.20 to 0.26)
      // Q wave (t = 0.26 to 0.29)
      else if (t >= 0.26 && t <= 0.29) {
        val -= 0.15 * Math.sin(((t - 0.26) / 0.03) * Math.PI);
      }
      // R wave spike (t = 0.29 to 0.35)
      else if (t >= 0.29 && t <= 0.35) {
        const rHeight = isAbnormal ? 1.4 : 1.1;
        val += rHeight * Math.sin(((t - 0.29) / 0.06) * Math.PI);
      }
      // S wave dip (t = 0.35 to 0.39)
      else if (t >= 0.35 && t <= 0.39) {
        val -= 0.35 * Math.sin(((t - 0.35) / 0.04) * Math.PI);
      }
      // ST segment (t = 0.39 to 0.48)
      else if (t >= 0.39 && t <= 0.48) {
        val += isAbnormal ? 0.15 : 0.02; // Mild ST elevation if abnormal
      }
      // T wave (t = 0.48 to 0.65)
      else if (t >= 0.48 && t <= 0.65) {
        val += 0.28 * Math.sin(((t - 0.48) / 0.17) * Math.PI);
      }

      // Add slight physiological micro-noise
      val += (Math.random() - 0.5) * 0.015;
      points.push(parseFloat(val.toFixed(3)));
    }

    return points;
  }

  public analyzeECG(input: IECGAnalysisInput): IECGAnalysisOutput {
    const hr = input.heartRateBpm || 72;
    const pr = input.prIntervalMs || 160;
    const qrs = input.qrsDurationMs || 90;
    const qt = input.qtIntervalMs || 400;

    // Bazett's Formula: QTc = QT / sqrt(RR in seconds)
    const rrSeconds = 60 / Math.max(hr, 30);
    const qtc = Math.round(qt / Math.sqrt(rrSeconds));

    const abnormalities: string[] = [...(input.abnormalitiesDetected || [])];
    let isDeteriorating = false;
    const changes: string[] = [];

    // Diagnostic evaluations
    if (hr < 60) abnormalities.push('Sinus Bradycardia (< 60 bpm)');
    if (hr > 100) abnormalities.push('Sinus Tachycardia (> 100 bpm)');
    if (pr > 200) abnormalities.push('First-Degree Atrioventricular (AV) Block (PR > 200ms)');
    if (qrs > 120) abnormalities.push('Intraventricular Conduction Delay / Bundle Branch Block (QRS > 120ms)');
    if (qtc > 460) abnormalities.push(`Prolonged QTc Interval (${qtc}ms, threshold 460ms)`);

    if (input.stSegmentChanges && input.stSegmentChanges.toLowerCase().includes('elevation')) {
      abnormalities.push('ST-Segment Elevation (Potential Myocardial Injury)');
      isDeteriorating = true;
    }

    // Longitudinal comparison against previous ECG baseline
    let deltaNotes = 'Initial baseline ECG recorded.';
    if (input.previousEcg) {
      const prev = input.previousEcg;
      const hrDelta = hr - prev.heartRateBpm;
      const qtcDelta = qtc - prev.qtcIntervalMs;

      if (Math.abs(hrDelta) >= 15) {
        changes.push(`Heart rate shifted by ${hrDelta > 0 ? '+' : ''}${hrDelta} bpm (from ${prev.heartRateBpm} to ${hr} bpm)`);
      }
      if (qtcDelta >= 25) {
        changes.push(`QTc prolongation increased by +${qtcDelta}ms (from ${prev.qtcIntervalMs}ms to ${qtc}ms)`);
        isDeteriorating = true;
      }
      if (prev.rhythm !== (input.rhythm || 'Normal Sinus Rhythm')) {
        changes.push(`Rhythm alteration: changed from "${prev.rhythm}" to "${input.rhythm || 'Normal Sinus Rhythm'}"`);
        isDeteriorating = true;
      }

      if (changes.length > 0) {
        deltaNotes = `Compared to ECG from ${new Date(prev.recordDate).toLocaleDateString()}: ${changes.join('. ')}.`;
      } else {
        deltaNotes = `Longitudinally stable compared to baseline from ${new Date(prev.recordDate).toLocaleDateString()}.`;
      }
    }

    const rhythm = input.rhythm || (abnormalities.length > 0 ? 'Sinus Rhythm with Non-specific Variations' : 'Normal Sinus Rhythm');
    const aiInterpretation = abnormalities.length === 0
      ? `Normal 12-lead ECG. Sinus rhythm at ${hr} bpm with normal PR (${pr}ms), QRS (${qrs}ms), and QTc (${qtc}ms) intervals. No acute ST-T wave abnormalities.`
      : `ECG indicates ${rhythm} at ${hr} bpm. Identified findings: ${abnormalities.join(', ')}. ${deltaNotes}`;

    const waveformPoints = this.generateWaveformPoints(hr, abnormalities.length > 0);

    return {
      heartRateBpm: hr,
      prIntervalMs: pr,
      qrsDurationMs: qrs,
      qtIntervalMs: qt,
      qtcIntervalMs: qtc,
      rhythm,
      axis: 'Normal (0° to +90°)',
      stSegment: input.stSegmentChanges || 'Normal, no ischemic ST deviation',
      abnormalities,
      aiInterpretation,
      baselineComparison: {
        previousEcgId: input.previousEcg?._id,
        previousDate: input.previousEcg?.recordDate,
        changesDetected: changes,
        isDeteriorating,
        deltaNotes,
      },
      waveformPoints,
    };
  }
}

export const ecgAgentInstance = new ECGAgent();

