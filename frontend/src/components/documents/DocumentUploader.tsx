import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { aiApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { MedicalReport, ECGRecord, RiskAssessment, Investigation } from '../../types';

interface DocumentUploaderProps {
  onUploadSuccess: (data: {
    report: MedicalReport;
    ecg?: ECGRecord;
    riskAssessment?: RiskAssessment;
    investigationsNeeded?: Investigation[];
  }) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { addToast } = useNotification();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(20);

    const formData = new FormData();
    formData.append('reportFile', selectedFile);

    try {
      // Simulate visual progress increments
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 300);

      const res = await aiApi.uploadReportFile(formData);
      clearInterval(interval);
      setProgress(100);

      if (res.success) {
        addToast({
          type: 'success',
          title: 'Document Ingested Successfully',
          message: `Extracted ${res.report?.reportType} with AI structured data.`,
        });
        onUploadSuccess(res);
        setSelectedFile(null);
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: error.message || 'Could not parse document.',
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
          dragActive
            ? 'border-cardio-500 bg-cardio-50/50 dark:bg-cardio-950/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-cardio-400 bg-slate-50/50 dark:bg-navy-850/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.csv,.txt"
          onChange={handleChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-3xl bg-cardio-100 dark:bg-cardio-950/80 text-cardio-600 dark:text-cardio-400 flex items-center justify-center mb-4 shadow-subtle">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1">
          {selectedFile ? selectedFile.name : 'Upload Cardiovascular Report or ECG'}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
          Drag & drop your ECG PDF, Lipid Panel, Echocardiogram, or Prescription. CARDIA-X AI will extract lab values and intervals automatically.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700">PDF</span>
          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700">PNG / JPG</span>
          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700">12-Lead ECG</span>
          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700">Max 25MB</span>
        </div>
      </div>

      {/* Selected File Card & Submit */}
      {selectedFile && (
        <div className="p-4 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 truncate">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <File className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
              <p className="text-[11px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={uploading}
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
            >
              Run AI Extraction
            </Button>
          </div>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="space-y-1.5 p-4 rounded-2xl bg-cardio-50 dark:bg-navy-850 border border-cardio-200 dark:border-cardio-900 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-cardio-700 dark:text-cardio-300">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Document Intelligence Agent processing OCR & Lab values...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-navy-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cardio-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

