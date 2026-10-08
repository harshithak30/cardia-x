import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, FileImage, Plus, Trash2, Upload } from 'lucide-react';
import { patientApi } from '../../api';
import { HistoricalPrescription } from '../../types';
import { Button } from '../common/Button';
import { Card, CardContent, CardHeader } from '../common/Card';
import { useNotification } from '../../context/NotificationContext';

interface HistoricalPrescriptionReviewProps {
  onConfirmed: () => void;
}

export const HistoricalPrescriptionReview: React.FC<HistoricalPrescriptionReviewProps> = ({ onConfirmed }) => {
  const [prescriptions, setPrescriptions] = useState<HistoricalPrescription[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { addToast } = useNotification();

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const result = await patientApi.getHistoricalPrescriptions();
      if (result.success) setPrescriptions(result.prescriptions);
    } catch (error: any) {
      addToast({ type: 'error', title: 'Could not load prescriptions', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) return;
    const data = new FormData();
    data.append('prescriptionFile', selectedFile);
    setUploading(true);
    try {
      const result = await patientApi.uploadHistoricalPrescription(data);
      if (result.success) {
        setPrescriptions((current) => [result.prescription, ...current]);
        setSelectedFile(null);
        addToast({
          type: 'success',
          title: 'Prescription uploaded for review',
          message: 'Check the extracted details and correct them before confirming the historical record.',
        });
      }
    } catch (error: any) {
      addToast({ type: 'error', title: 'Upload failed', message: error.message });
    } finally {
      setUploading(false);
    }
  };

  const updatePrescription = (prescriptionId: string, update: (item: HistoricalPrescription) => HistoricalPrescription) => {
    setPrescriptions((current) => current.map((item) => item._id === prescriptionId ? update(item) : item));
  };

  const handleConfirm = async (prescription: HistoricalPrescription) => {
    setConfirmingId(prescription._id);
    try {
      const result = await patientApi.confirmHistoricalPrescription(prescription._id, prescription.medications);
      if (result.success) {
        setPrescriptions((current) => current.map((item) => item._id === prescription._id ? result.prescription : item));
        addToast({ type: 'success', title: 'Prescription details confirmed', message: result.message });
        onConfirmed();
      }
    } catch (error: any) {
      addToast({ type: 'error', title: 'Could not confirm details', message: error.message });
    } finally {
      setConfirmingId(null);
    }
  };

  const handleRetryOcr = async (prescription: HistoricalPrescription) => {
    setRetryingId(prescription._id);
    try {
      const result = await patientApi.retryHistoricalPrescriptionOcr(prescription._id);
      if (result.success) {
        setPrescriptions((current) => current.map((item) => item._id === prescription._id ? result.prescription : item));
        addToast({ type: 'success', title: 'Scan processed', message: result.prescription.medications.length ? 'Review the extracted suggestions against the original.' : 'No catalog medication names were recognized. You can still add details manually.' });
      }
    } catch (error: any) {
      addToast({ type: 'error', title: 'OCR retry failed', message: error.message });
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Previous Doctor Prescriptions"
        subtitle="Select a photo or scanned copy of an older prescription to add it to your history."
        icon={<FileImage className="h-5 w-5 text-cardio-600" />}
      />
      <CardContent className="space-y-5">
        <form onSubmit={handleUpload} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-navy-900">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            className="hidden"
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} icon={<FileImage className="h-4 w-4" />}>
            Choose prescription file
          </Button>
          <span className="min-w-0 flex-1 truncate text-xs text-slate-600 dark:text-slate-300">
            {selectedFile ? `${selectedFile.name} · ${(selectedFile.size / 1024).toFixed(0)} KB` : 'No file selected'}
          </span>
          <Button type="submit" variant="primary" size="sm" loading={uploading} disabled={!selectedFile} icon={<Upload className="h-4 w-4" />}>
            Upload prescription
          </Button>
        </form>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          PDF, JPG, or PNG up to 25 MB. Historical records do not change your active medication schedule.
        </p>

        {prescriptions.map((prescription) => (
          <section key={prescription._id} className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <button type="button" onClick={() => patientApi.openHistoricalPrescription(prescription._id).catch((error: any) => addToast({ type: 'error', title: 'Could not open scan', message: error.message }))} className="break-all text-left text-sm font-semibold text-cardio-700 underline dark:text-cardio-300">
                  {prescription.originalFileName}
                </button>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {prescription.doctorName || 'Doctor not identified'}
                  {prescription.hospitalName ? ` · ${prescription.hospitalName}` : ''}
                  {prescription.prescriptionDate ? ` · ${new Date(prescription.prescriptionDate).toLocaleDateString()}` : ''}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${prescription.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                {prescription.status === 'confirmed' ? 'Confirmed' : 'Review needed'}
              </span>
            </div>

            {prescription.extractionNote && (
              <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p>{prescription.extractionNote}</p>
              </div>
            )}

            {prescription.recognizedText && (
              <details open={prescription.medications.length === 0} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-navy-900">
                <summary className="cursor-pointer font-semibold text-slate-700 dark:text-slate-200">View extracted prescription text</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-slate-600 dark:text-slate-300">{prescription.recognizedText}</pre>
              </details>
            )}

            <div className="space-y-3">
              {prescription.medications.map((medication, index) => (
                <div key={`${prescription._id}-${index}`} className="grid grid-cols-1 gap-2 sm:grid-cols-[1.2fr_0.8fr_1fr_auto]">
                  {(['name', 'dosage', 'frequency'] as const).map((field) => (
                    <input
                      key={field}
                      aria-label={`Medication ${index + 1} ${field}`}
                      disabled={prescription.status === 'confirmed'}
                      value={medication[field]}
                      onChange={(event) => updatePrescription(prescription._id, (item) => ({
                        ...item,
                        medications: item.medications.map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: event.target.value } : entry),
                      }))}
                      placeholder={field === 'name' ? 'Medication name' : field === 'dosage' ? 'Dose / strength' : 'Frequency'}
                      className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-navy-900"
                    />
                  ))}
                  {prescription.status === 'pending_review' && (
                    <button
                      type="button"
                      aria-label={`Remove medication ${index + 1}`}
                      onClick={() => updatePrescription(prescription._id, (item) => ({ ...item, medications: item.medications.filter((_, entryIndex) => entryIndex !== index) }))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {prescription.medications.length === 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">No medication names were extracted. Retry OCR or add details manually from the original scan.</p>
                  {prescription.status === 'pending_review' && (
                    <Button type="button" variant="secondary" size="sm" loading={retryingId === prescription._id} onClick={() => handleRetryOcr(prescription)}>
                      Retry OCR
                    </Button>
                  )}
                </div>
              )}
            </div>

            {prescription.status === 'pending_review' && (
              <div className="flex flex-wrap justify-between gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => updatePrescription(prescription._id, (item) => ({ ...item, medications: [...item.medications, { name: '', dosage: '', frequency: '' }] }))}
                >
                  Add medication row
                </Button>
                <Button type="button" variant="vital" size="sm" loading={confirmingId === prescription._id} icon={<Check className="h-4 w-4" />} onClick={() => handleConfirm(prescription)}>
                  Confirm historical record
                </Button>
              </div>
            )}
          </section>
        ))}

        {!loading && prescriptions.length === 0 && (
          <p className="py-3 text-center text-xs text-slate-400">No previous prescription scans uploaded.</p>
        )}
      </CardContent>
    </Card>
  );
};