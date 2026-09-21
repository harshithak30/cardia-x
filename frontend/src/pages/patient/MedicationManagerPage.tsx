import React, { useEffect, useState } from 'react';
import { patientApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { AdherenceBarChart } from '../../components/charts/AdherenceBarChart';
import { Medication } from '../../types';
import {
  Pill,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sun,
  Sunset,
  Moon,
  Info,
} from 'lucide-react';

export const MedicationManagerPage: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { addToast } = useNotification();

  // New Medication Form
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily in the morning',
    timing: { morning: true, afternoon: false, evening: false, night: false },
    foodInstructions: 'Take with water after breakfast',
    purpose: 'Cardiovascular management',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMeds = async () => {
    try {
      setLoading(true);
      const res = await patientApi.getMedications();
      if (res.success) {
        setMedications(res.medications);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  const handleLogStatus = async (medId: string, slot: string, status: 'taken' | 'missed') => {
    try {
      const res = await patientApi.logMedication(medId, { slot, status });
      if (res.success) {
        addToast({
          type: 'success',
          title: `Dose Logged as ${status.toUpperCase()}`,
          message: 'Medication adherence score recalculated.',
        });
        fetchMeds();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await patientApi.addMedication(newMed);
      if (res.success) {
        addToast({
          type: res.warning ? 'warning' : 'success',
          title: res.warning ? 'Duplicate Class Alert' : 'Prescription Saved',
          message: res.warning || 'Medication schedule added to daily reminders.',
        });
        setIsAddModalOpen(false);
        setNewMed({
          name: '',
          dosage: '',
          frequency: 'Once daily in the morning',
          timing: { morning: true, afternoon: false, evening: false, night: false },
          foodInstructions: 'Take with water after breakfast',
          purpose: 'Cardiovascular management',
        });
        fetchMeds();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to add', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cardiovascular Medications & Adherence</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Intelligent dosage reminders, duplicate class detection, and pharmacovigilance interaction monitoring.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Medication
        </Button>
      </div>

      {/* Compliance Overview Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Daily Dose Reminder Slots"
            subtitle={`Schedule for Today, ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`}
            icon={<Clock className="w-5 h-5 text-indigo-600" />}
          />
          <CardContent className="space-y-4">
            {medications.map((med) => {
              const todayLogs = med.logs?.filter((l) => l.date === todayStr) || [];
              const morningLog = todayLogs.find((l) => l.slot === 'morning');
              const nightLog = todayLogs.find((l) => l.slot === 'night');

              return (
                <div
                  key={med._id}
                  className="p-4 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{med.name}</span>
                        <Badge variant="low" size="sm">
                          {med.dosage}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {med.frequency} • {med.foodInstructions}
                      </p>
                    </div>

                    <Badge variant={med.adherenceRate >= 90 ? 'low' : med.adherenceRate >= 70 ? 'medium' : 'high'} size="sm">
                      {med.adherenceRate}% Adherence
                    </Badge>
                  </div>

                  {/* Duplicate / Interaction Warnings */}
                  {med.duplicateWarning && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>{med.duplicateWarning}</span>
                    </div>
                  )}

                  {/* Slots Action Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {med.timing?.morning && (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Sun className="w-3.5 h-3.5 text-amber-500" /> Morning Dose:
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleLogStatus(med._id, 'morning', 'taken')}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors ${
                              morningLog?.status === 'taken'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {morningLog?.status === 'taken' ? 'Taken' : 'Mark Taken'}
                          </button>
                          <button
                            onClick={() => handleLogStatus(med._id, 'morning', 'missed')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                              morningLog?.status === 'missed'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Missed
                          </button>
                        </div>
                      </div>
                    )}

                    {med.timing?.night && (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Moon className="w-3.5 h-3.5 text-indigo-400" /> Night Dose:
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleLogStatus(med._id, 'night', 'taken')}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors ${
                              nightLog?.status === 'taken'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {nightLog?.status === 'taken' ? 'Taken' : 'Mark Taken'}
                          </button>
                          <button
                            onClick={() => handleLogStatus(med._id, 'night', 'missed')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                              nightLog?.status === 'missed'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Missed
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {medications.length === 0 && !loading && (
              <p className="text-xs text-slate-400 text-center py-8">No medications currently active.</p>
            )}
          </CardContent>
        </Card>

        {/* Adherence Chart */}
        <Card>
          <CardHeader
            title="Adherence Analytics"
            subtitle="7-Day completion rate"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          />
          <CardContent className="space-y-4">
            <AdherenceBarChart />
            <div className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">Clinical Tip (AHA):</p>
              <p className="text-[11px] leading-relaxed">
                Consistent daily statin and beta-blocker adherence reduces secondary ischemic coronary events by over 40%.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Medication Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Prescribed Medication"
        subtitle="The Medication Agent checks for class duplicates and adverse drug interactions automatically."
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Medication Name</label>
            <input
              type="text"
              required
              value={newMed.name}
              onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
              placeholder="e.g. Metoprolol Succinate, Atorvastatin, Lisinopril"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dosage (Strength)</label>
              <input
                type="text"
                required
                value={newMed.dosage}
                onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                placeholder="e.g. 25 mg, 40 mg"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
              <input
                type="text"
                required
                value={newMed.frequency}
                onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                placeholder="e.g. Once daily, Twice daily"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Reminder Slots</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={newMed.timing.morning}
                  onChange={(e) =>
                    setNewMed({ ...newMed, timing: { ...newMed.timing, morning: e.target.checked } })
                  }
                  className="rounded text-cardio-600 focus:ring-cardio-500"
                />
                Morning Slot (8 AM)
              </label>

              <label className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={newMed.timing.night}
                  onChange={(e) =>
                    setNewMed({ ...newMed, timing: { ...newMed.timing, night: e.target.checked } })
                  }
                  className="rounded text-cardio-600 focus:ring-cardio-500"
                />
                Night Slot (9 PM)
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Administration / Food Note</label>
            <input
              type="text"
              value={newMed.foodInstructions}
              onChange={(e) => setNewMed({ ...newMed, foodInstructions: e.target.value })}
              placeholder="e.g. Take with water after breakfast"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Validate & Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

