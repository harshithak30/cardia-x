import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { HeartRateChart } from '../../components/charts/HeartRateChart';
import { BloodPressureChart } from '../../components/charts/BloodPressureChart';
import { ECGWaveformCanvas } from '../../components/charts/ECGWaveformCanvas';
import { PatientTimeline } from '../../components/timeline/PatientTimeline';
import { RecommendationApprovalModal } from '../../components/doctor/RecommendationApprovalModal';
import {
  User,
  ArrowLeft,
  Activity,
  Heart,
  Pill,
  FileText,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  ShieldCheck,
  GitCommit,
} from 'lucide-react';

export const DoctorPatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ecg' | 'timeline' | 'meds' | 'notes'>('overview');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const { addToast } = useNotification();

  // SOAP Note Form
  const [soapNote, setSoapNote] = useState({
    title: 'Cardiology Ambulatory Progress Note',
    subjective: 'Patient reports occasional exertional fatigue. Denies acute rest angina or syncopal episodes.',
    objective: 'BP 134/84 mmHg, HR 74 bpm regular, SpO2 98%. Chest clear. Normal S1/S2 without new murmurs.',
    assessment: 'CAD status post-PCI, Stage 1 HTN, Sub-target LDL-C.',
    plan: 'Continue Metoprolol 50mg and Aspirin 81mg. Initiate Ezetimibe 10mg. Repeat fasting lipid panel in 6 weeks.',
  });
  const [savingNote, setSavingNote] = useState(false);
  const [savingMedication, setSavingMedication] = useState(false);
  const [medicationForm, setMedicationForm] = useState({
    name: '', genericName: '', dosage: '', frequency: 'Once daily', purpose: '', foodInstructions: '',
    startDate: new Date().toISOString().split('T')[0], endDate: '',
    timing: { morning: true, afternoon: false, evening: false, night: false },
  });

  // Approval Modal
  const [approvalModal, setApprovalModal] = useState<{ isOpen: boolean; type: 'risk' | 'investigation'; item: any }>({
    isOpen: false,
    type: 'risk',
    item: null,
  });

  const fetchPatientDossier = async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const res = await doctorApi.getPatient360(patientId);
      if (res.success) {
        setData(res.patient360);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error loading patient dossier', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDossier();
  }, [patientId]);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    setSavingNote(true);
    try {
      await doctorApi.addDoctorNote(patientId, soapNote);
      addToast({ type: 'success', title: 'Clinical Progress Note Added', message: 'Note synchronized with patient timeline.' });
      setIsNoteModalOpen(false);
      fetchPatientDossier();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to add note', message: err.message });
    } finally {
      setSavingNote(false);
    }
  };

  const handlePrescribeMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    setSavingMedication(true);
    try {
      const result = await doctorApi.prescribeMedication(patientId, medicationForm);
      addToast({
        type: result.warning || result.interactions?.length ? 'warning' : 'success',
        title: 'Medication prescribed',
        message: result.warning || (result.interactions?.length ? 'Review the interaction warnings.' : 'Medication added to the patient timeline.'),
      });
      setIsMedicationModalOpen(false);
      fetchPatientDossier();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Prescription failed', message: err.message });
    } finally {
      setSavingMedication(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-slate-200 dark:bg-navy-800 rounded-2xl" />
        <div className="h-96 bg-slate-200 dark:bg-navy-800 rounded-3xl" />
      </div>
    );
  }

  const u = data.user || {};
  const profile = data.profile || {};
  const ecgs = data.ecgs || [];
  const latestEcg = ecgs[0];
  const meds = data.medications || [];
  const vitals = data.vitalsHistory || [];
  const timeline = data.worldModel?.timeline || [];
  const notes = data.doctorNotes || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/doctor/patients">
            <button className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{u.fullName}</h1>
              <Badge variant={profile.overallRiskLevel === 'HIGH' ? 'high' : 'medium'} dot size="sm">
                {profile.overallRiskLevel} RISK
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ID: {u._id} • {profile.age || 52} yrs • {profile.gender?.toUpperCase()} • BP: {profile.bloodGroup} • BMI: {profile.bmi || 26.5}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="vital"
            size="sm"
            onClick={() => setIsNoteModalOpen(true)}
            icon={<Stethoscope className="w-4 h-4" />}
          >
            Add SOAP Note
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsMedicationModalOpen(true)}
            icon={<Pill className="w-4 h-4" />}
          >
            Prescribe Medication
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: 'overview', label: '360° Clinical Overview', icon: Activity },
          { id: 'ecg', label: '12-Lead ECG History', icon: Heart },
          { id: 'timeline', label: 'Patient World Model', icon: GitCommit },
          { id: 'meds', label: 'Medications & Adherence', icon: Pill },
          { id: 'notes', label: 'Physician Progress Notes', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                activeTab === tab.id
                  ? 'bg-cardio-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Vitals & ECG strip */}
            <div className="lg:col-span-2 space-y-6">
              {latestEcg && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Most Recent 12-Lead ECG</h3>
                  <ECGWaveformCanvas
                    waveformPoints={latestEcg.waveformPoints}
                    heartRate={latestEcg.heartRateBpm}
                    rhythmTitle={latestEcg.rhythm}
                  />
                </div>
              )}

              <Card>
                <CardHeader
                  title="Longitudinal Hemodynamics"
                  subtitle="14-Day Blood Pressure & Heart Rate Log"
                  icon={<Activity className="w-5 h-5 text-cardio-600" />}
                />
                <CardContent>
                  <BloodPressureChart data={vitals} height={220} />
                </CardContent>
              </Card>
            </div>

            {/* Right 1 Col: AI Summary & Active Diagnoses */}
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Cardiovascular AI Summary"
                  subtitle="Risk-adaptive synthesis"
                  icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
                />
                <CardContent className="space-y-3 text-xs">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-navy-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {data.worldModel?.currentTrends?.aiClinicalNarrative || 'Patient maintained on guideline-directed therapy.'}
                  </p>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">Active Diagnoses:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                      {profile.medicalHistory?.heartDiseases?.map((d: string, idx: number) => (
                        <li key={idx}>{d}</li>
                      ))}
                      {profile.medicalHistory?.hasHypertension && <li>Essential Arterial Hypertension</li>}
                      {profile.medicalHistory?.hasDiabetes && <li>Type 2 Diabetes Mellitus</li>}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ECG */}
      {activeTab === 'ecg' && (
        <div className="space-y-6">
          {ecgs.map((item: any) => (
            <Card key={item._id}>
              <CardHeader
                title={`12-Lead ECG (${item.rhythm})`}
                subtitle={`Recorded: ${new Date(item.recordDate).toLocaleDateString()} • HR: ${item.heartRateBpm} bpm`}
                icon={<Activity className="w-5 h-5 text-emerald-500" />}
              />
              <CardContent className="space-y-4">
                <ECGWaveformCanvas waveformPoints={item.waveformPoints} heartRate={item.heartRateBpm} rhythmTitle={item.rhythm} />
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="p-2 bg-slate-50 dark:bg-navy-900 rounded-xl">PR: {item.prIntervalMs}ms</div>
                  <div className="p-2 bg-slate-50 dark:bg-navy-900 rounded-xl">QRS: {item.qrsDurationMs}ms</div>
                  <div className="p-2 bg-slate-50 dark:bg-navy-900 rounded-xl">QT: {item.qtIntervalMs}ms</div>
                  <div className="p-2 bg-slate-50 dark:bg-navy-900 rounded-xl font-bold text-cardio-600">QTc: {item.qtcIntervalMs}ms</div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">{item.aiInterpretation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: TIMELINE */}
      {activeTab === 'timeline' && (
        <Card>
          <CardHeader
            title="Cardiovascular Patient World Model Timeline"
            subtitle="Chronological event log"
            icon={<GitCommit className="w-5 h-5 text-cardio-600" />}
          />
          <CardContent>
            <PatientTimeline events={timeline} />
          </CardContent>
        </Card>
      )}

      {/* TAB 4: MEDICATIONS */}
      {activeTab === 'meds' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsMedicationModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Prescribe Medication
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meds.map((m: any) => (
              <Card key={m._id} className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</span>
                  <Badge variant="low" size="sm">
                    {m.adherenceRate}% Adherence
                  </Badge>
                </div>
                <p className="text-slate-500">{m.dosage} • {m.frequency}</p>
                <p className="text-slate-600 dark:text-slate-300">{m.foodInstructions}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PROGRESS NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {notes.map((n: any) => (
            <Card key={n._id} className="p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                <span className="text-slate-400">{new Date(n.noteDate).toLocaleDateString()}</span>
              </div>
              <div className="space-y-2">
                <div>
                  <strong className="text-cardio-600 uppercase text-[10px] tracking-wider block">Subjective:</strong>
                  <p className="text-slate-700 dark:text-slate-300">{n.soap?.subjective}</p>
                </div>
                <div>
                  <strong className="text-cardio-600 uppercase text-[10px] tracking-wider block">Objective:</strong>
                  <p className="text-slate-700 dark:text-slate-300">{n.soap?.objective}</p>
                </div>
                <div>
                  <strong className="text-cardio-600 uppercase text-[10px] tracking-wider block">Assessment:</strong>
                  <p className="text-slate-700 dark:text-slate-300">{n.soap?.assessment}</p>
                </div>
                <div>
                  <strong className="text-cardio-600 uppercase text-[10px] tracking-wider block">Plan:</strong>
                  <p className="text-slate-700 dark:text-slate-300">{n.soap?.plan}</p>
                </div>
              </div>
            </Card>
          ))}

          {notes.length === 0 && <p className="text-xs text-slate-400 text-center py-8">No progress notes written yet.</p>}
        </div>
      )}

      {/* SOAP Note Creator Modal */}
      <Modal
        isOpen={isMedicationModalOpen}
        onClose={() => setIsMedicationModalOpen(false)}
        title="Prescribe Medication"
        subtitle="This prescription will be recorded under your clinician identity and added to the patient timeline."
        maxWidth="lg"
      >
        <form onSubmit={handlePrescribeMedication} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['name', 'Medication name', 'e.g. Atorvastatin'],
              ['genericName', 'Generic name', 'Optional'],
              ['dosage', 'Dosage', 'e.g. 40 mg'],
              ['frequency', 'Frequency', 'e.g. Once daily at night'],
              ['purpose', 'Purpose', 'e.g. LDL reduction'],
              ['foodInstructions', 'Food instructions', 'e.g. With evening meal'],
              ['startDate', 'Start date', ''],
              ['endDate', 'End date', 'Optional'],
            ].map(([key, label, placeholder]) => (
              <label key={key} className="space-y-1">
                <span className="block font-semibold">{label}</span>
                <input
                  type={key.toLowerCase().includes('date') ? 'date' : 'text'}
                  required={['name', 'dosage', 'frequency'].includes(key)}
                  value={(medicationForm as any)[key]}
                  placeholder={placeholder}
                  onChange={(event) => setMedicationForm({ ...medicationForm, [key]: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-navy-900"
                />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            {(['morning', 'afternoon', 'evening', 'night'] as const).map((slot) => (
              <label key={slot} className="flex items-center gap-1.5 font-semibold capitalize">
                <input
                  type="checkbox"
                  checked={medicationForm.timing[slot]}
                  onChange={(event) => setMedicationForm({ ...medicationForm, timing: { ...medicationForm.timing, [slot]: event.target.checked } })}
                />
                {slot}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsMedicationModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" loading={savingMedication}>Save Prescription</Button>
          </div>
        </form>
      </Modal>

      {/* SOAP Note Creator Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Add Clinical SOAP Progress Note"
        subtitle="Permanent medical documentation stored in Patient World Model."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Subjective (S)</label>
            <textarea
              rows={2}
              required
              value={soapNote.subjective}
              onChange={(e) => setSoapNote({ ...soapNote, subjective: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Objective (O)</label>
            <textarea
              rows={2}
              required
              value={soapNote.objective}
              onChange={(e) => setSoapNote({ ...soapNote, objective: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Assessment (A)</label>
            <textarea
              rows={2}
              required
              value={soapNote.assessment}
              onChange={(e) => setSoapNote({ ...soapNote, assessment: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Plan (P)</label>
            <textarea
              rows={2}
              required
              value={soapNote.plan}
              onChange={(e) => setSoapNote({ ...soapNote, plan: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={savingNote}>
              Save SOAP Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approval Modal */}
      <RecommendationApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ ...approvalModal, isOpen: false })}
        type={approvalModal.type}
        item={approvalModal.item}
        onSuccess={() => fetchPatientDossier()}
      />
    </div>
  );
};

