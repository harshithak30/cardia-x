import React, { useEffect, useState } from 'react';
import { patientApi, aiApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ECGWaveformCanvas } from '../../components/charts/ECGWaveformCanvas';
import { ECGRecord } from '../../types';
import {
  Activity,
  GitCompare,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const ECGAnalysisPage: React.FC = () => {
  const [ecgs, setEcgs] = useState<ECGRecord[]>([]);
  const [selectedEcg, setSelectedEcg] = useState<ECGRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const { addToast } = useNotification();

  // Manual ECG Entry Form
  const [manualForm, setManualForm] = useState({
    heartRateBpm: 76,
    prIntervalMs: 160,
    qrsDurationMs: 90,
    qtIntervalMs: 400,
    rhythm: 'Normal Sinus Rhythm',
    stSegmentChanges: 'Normal baseline, no ST elevation',
  });
  const [analyzing, setAnalyzing] = useState(false);

  const fetchEcgs = async () => {
    try {
      setLoading(true);
      const res = await patientApi.getEcgs();
      if (res.success) {
        setEcgs(res.ecgs);
        if (res.ecgs.length > 0 && !selectedEcg) {
          setSelectedEcg(res.ecgs[0]);
        }
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEcgs();
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const res = await aiApi.analyzeManualEcg(manualForm);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'ECG Analyzed Successfully',
          message: `Calculated QTc interval and delta comparison against baseline.`,
        });
        setIsManualModalOpen(false);
        fetchEcgs();
        setSelectedEcg(res.record);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Analysis Error', message: err.message });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">12-Lead ECG Analysis & Comparison</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated intervals (PR, QRS, QTc), repolarization vectors, and longitudinal baseline delta tracking.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsManualModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Analyze New ECG Tracing
        </Button>
      </div>

      {/* Primary Display: Selected ECG Waveform & Intervals */}
      {selectedEcg && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Waveform Strip (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <ECGWaveformCanvas
                waveformPoints={selectedEcg.waveformPoints}
                heartRate={selectedEcg.heartRateBpm}
                rhythmTitle={selectedEcg.rhythm}
              />

              {/* Interval Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-subtle">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">PR Interval</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                    {selectedEcg.prIntervalMs} <span className="text-xs font-normal text-slate-400">ms</span>
                  </span>
                  <span className="text-[10px] text-emerald-500 font-semibold">Normal (120-200)</span>
                </div>

                <div className="p-4 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-subtle">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">QRS Duration</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                    {selectedEcg.qrsDurationMs} <span className="text-xs font-normal text-slate-400">ms</span>
                  </span>
                  <span className="text-[10px] text-emerald-500 font-semibold">Normal (&lt; 120)</span>
                </div>

                <div className="p-4 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-subtle">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">QT Interval</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                    {selectedEcg.qtIntervalMs} <span className="text-xs font-normal text-slate-400">ms</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Raw Uncorrected</span>
                </div>

                <div className="p-4 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-subtle">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">QTc (Bazett)</span>
                  <span className={`text-xl font-bold mt-1 block ${selectedEcg.qtcIntervalMs > 460 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                    {selectedEcg.qtcIntervalMs} <span className="text-xs font-normal text-slate-400">ms</span>
                  </span>
                  <span className={`text-[10px] font-semibold ${selectedEcg.qtcIntervalMs > 460 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {selectedEcg.qtcIntervalMs > 460 ? 'Prolonged (> 460)' : 'Normal (< 450)'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Diagnosis & Longitudinal Comparison (1 Col) */}
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="AI Clinical Interpretation"
                  subtitle={`Record Date: ${new Date(selectedEcg.recordDate).toLocaleDateString()}`}
                  icon={<Activity className="w-5 h-5 text-cardio-600" />}
                />
                <CardContent className="space-y-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-sm">{selectedEcg.rhythm}</span>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {selectedEcg.aiInterpretation}
                    </p>
                  </div>

                  {selectedEcg.abnormalities && selectedEcg.abnormalities.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Identified Variations</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEcg.abnormalities.map((abn, i) => (
                          <Badge key={i} variant="medium" size="sm">
                            {abn}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Longitudinal Baseline Delta Comparison */}
                  <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-sky-900 dark:text-sky-300 font-bold">
                      <GitCompare className="w-4 h-4" />
                      <span>Longitudinal Comparison to Prior Baseline</span>
                    </div>
                    <p className="text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed">
                      {selectedEcg.baselineComparison?.deltaNotes || 'No significant interval shifts detected compared to baseline.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Historical ECG Tracings List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Longitudinal ECG Tracing History</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ecgs.map((item) => (
            <Card
              key={item._id}
              hover
              onClick={() => setSelectedEcg(item)}
              className={`p-4 cursor-pointer transition-all ${
                selectedEcg?._id === item._id ? 'border-cardio-500 ring-2 ring-cardio-500/20' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.rhythm}</span>
                <Badge variant={item.abnormalities?.length ? 'medium' : 'low'} size="sm">
                  {item.heartRateBpm} BPM
                </Badge>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>PR: {item.prIntervalMs}ms</span>
                <span>QRS: {item.qrsDurationMs}ms</span>
                <span>QTc: {item.qtcIntervalMs}ms</span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(item.recordDate).toLocaleDateString()}
                </span>
                <span className="text-cardio-600 dark:text-cardio-400 font-semibold">Inspect Waveform →</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Manual ECG Analysis Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Analyze 12-Lead ECG Tracing"
        subtitle="Input diagnostic intervals to trigger the ECG Analysis Agent & Bazett QTc calculation."
        maxWidth="md"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Heart Rate (BPM)</label>
              <input
                type="number"
                required
                value={manualForm.heartRateBpm}
                onChange={(e) => setManualForm({ ...manualForm, heartRateBpm: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">PR Interval (ms)</label>
              <input
                type="number"
                required
                value={manualForm.prIntervalMs}
                onChange={(e) => setManualForm({ ...manualForm, prIntervalMs: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">QRS Duration (ms)</label>
              <input
                type="number"
                required
                value={manualForm.qrsDurationMs}
                onChange={(e) => setManualForm({ ...manualForm, qrsDurationMs: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">QT Interval (ms)</label>
              <input
                type="number"
                required
                value={manualForm.qtIntervalMs}
                onChange={(e) => setManualForm({ ...manualForm, qtIntervalMs: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rhythm Classification</label>
            <input
              type="text"
              required
              value={manualForm.rhythm}
              onChange={(e) => setManualForm({ ...manualForm, rhythm: e.target.value })}
              placeholder="e.g. Normal Sinus Rhythm, Atrial Fibrillation"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ST-Segment Assessment</label>
            <input
              type="text"
              value={manualForm.stSegmentChanges}
              onChange={(e) => setManualForm({ ...manualForm, stSegmentChanges: e.target.value })}
              placeholder="e.g. Normal, or 1mm depression in V5-V6"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={analyzing}>
              Run ECG Agent
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

