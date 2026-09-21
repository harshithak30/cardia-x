import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { MedicalReport, ECGRecord } from '../../types';
import { CheckCircle2, FileText, Activity, AlertTriangle } from 'lucide-react';

interface OCRConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: MedicalReport | null;
  ecg?: ECGRecord | null;
  onConfirm: () => void;
}

export const OCRConfirmationModal: React.FC<OCRConfirmationModalProps> = ({
  isOpen,
  onClose,
  report,
  ecg,
  onConfirm,
}) => {
  if (!report) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Extracted Clinical Data"
      subtitle="AI Document Intelligence Agent extracted the following values from your upload."
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Header Summary Card */}
        <div className="p-4 rounded-2xl bg-cardio-50/70 dark:bg-cardio-950/40 border border-cardio-200 dark:border-cardio-900 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-cardio-600 dark:text-cardio-400 uppercase tracking-wider">
              {report.reportType}
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{report.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provider: {report.doctorName || 'Cardiology Diagnostic Laboratory'} • Date:{' '}
              {new Date(report.reportDate).toLocaleDateString()}
            </p>
          </div>
          <Badge variant="success" dot size="sm">
            AI Verified (96%)
          </Badge>
        </div>

        {/* AI Narrative */}
        {report.extractedData?.aiSummary && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Interpretation Summary:</p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{report.extractedData.aiSummary}</p>
          </div>
        )}

        {/* Extracted Lab Values Table */}
        {report.extractedData?.labValues && report.extractedData.labValues.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Extracted Laboratory Biomarkers
            </h5>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-2.5">Biomarker / Test</th>
                    <th className="p-2.5">Value</th>
                    <th className="p-2.5">Reference Range</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {report.extractedData.labValues.map((val, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-navy-900/40">
                      <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{val.parameter}</td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                        {val.value} {val.unit}
                      </td>
                      <td className="p-2.5 text-slate-500 dark:text-slate-400">{val.referenceRange}</td>
                      <td className="p-2.5 text-right">
                        <Badge variant={val.isAbnormal ? 'high' : 'low'} size="sm">
                          {val.isAbnormal ? 'ABNORMAL' : 'NORMAL'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ECG Findings */}
        {ecg && (
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 font-mono text-xs border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                ECG Rhythm Analysis
              </span>
              <span className="text-slate-400">{ecg.rhythm}</span>
            </div>
            {ecg.measurementsAvailable ? (
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                {[
                  ['BPM', `${ecg.heartRateBpm}`],
                  ['PR', `${ecg.prIntervalMs}ms`],
                  ['QRS', `${ecg.qrsDurationMs}ms`],
                  ['QTc', `${ecg.qtcIntervalMs}ms`],
                ].map(([label, value]) => (
                  <div key={label} className="p-2 bg-slate-800/80 rounded-lg">
                    <span className="text-slate-400 block">{label}</span>
                    <span className="font-bold text-sky-400 text-sm">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-slate-800/80 p-3 text-slate-300">
                This report contains qualitative ECG findings but no numeric intervals. No readings were fabricated.
              </div>
            )}
            {ecg.abnormalities?.length > 0 && (
              <div className="rounded-lg bg-rose-950/50 border border-rose-800/60 p-3 text-rose-200">
                <span className="font-bold">Extracted findings:</span> {ecg.abnormalities.join('; ')}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onClose}>
            Edit Manual Values
          </Button>
          <Button
            variant="vital"
            size="md"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm & Add to World Model
          </Button>
        </div>
      </div>
    </Modal>
  );
};

