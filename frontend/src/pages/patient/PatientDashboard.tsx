import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { patientApi } from '../../api';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { HeartRateChart } from '../../components/charts/HeartRateChart';
import { BloodPressureChart } from '../../components/charts/BloodPressureChart';
import { ECGWaveformCanvas } from '../../components/charts/ECGWaveformCanvas';
import { RiskScoreGauge } from '../../components/charts/RiskScoreGauge';
import { AdherenceBarChart } from '../../components/charts/AdherenceBarChart';
import { DocumentUploader } from '../../components/documents/DocumentUploader';
import { OCRConfirmationModal } from '../../components/documents/OCRConfirmationModal';
import {
  Heart,
  Activity,
  Gauge,
  Moon,
  Footprints,
  Pill,
  Upload,
  MessageSquare,
  Sparkles,
  GitCommit,
  Plus,
  Calendar,
  AlertCircle,
  FileText,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManualVitalsOpen, setIsManualVitalsOpen] = useState(false);
  const [extractedReport, setExtractedReport] = useState<any>(null);
  const [extractedEcg, setExtractedEcg] = useState<any>(null);
  const [isOcrConfirmOpen, setIsOcrConfirmOpen] = useState(false);

  // Manual vitals form
  const [manualVitals, setManualVitals] = useState({
    systolic: 124,
    diastolic: 82,
    heartRate: 72,
    spo2: 98,
    weightKg: 74,
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await patientApi.getDashboard();
      if (res.success) {
        setData(res.dashboard);
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error Loading Dashboard',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMedicationLog = async (medId: string, slot: string, status: 'taken' | 'missed') => {
    try {
      await patientApi.logMedication(medId, { slot, status });
      addToast({
        type: 'success',
        title: `Medication Marked as ${status.toUpperCase()}`,
      });
      fetchDashboardData();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  const handleManualVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patientApi.addWearable({
        heartRate: { currentBpm: Number(manualVitals.heartRate) },
        bloodPressure: { systolic: Number(manualVitals.systolic), diastolic: Number(manualVitals.diastolic) },
        oxygenSaturation: { spo2Percentage: Number(manualVitals.spo2) },
        weightKg: Number(manualVitals.weightKg),
      });
      addToast({
        type: 'success',
        title: 'Vitals Recorded',
        message: 'Your physiological metrics were updated in the world model.',
      });
      setIsManualVitalsOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to record', message: err.message });
    }
  };

  const handleUploadComplete = (uploadRes: any) => {
    setIsUploadModalOpen(false);
    setExtractedReport(uploadRes.report);
    setExtractedEcg(uploadRes.ecg);
    setIsOcrConfirmOpen(true);
    fetchDashboardData();
  };

  if (loading && !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-slate-200 dark:bg-navy-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 dark:bg-navy-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-navy-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-navy-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-navy-800 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 lg:col-span-2 bg-slate-200 dark:bg-navy-800 rounded-3xl" />
          <div className="h-96 bg-slate-200 dark:bg-navy-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  const latestVitals = data?.vitals?.latest || {};
  const profile = data?.profile || {};
  const risk = data?.risk || {};
  const medications = data?.medications || [];
  const investigations = data?.investigations || [];
  const reports = data?.recentReports || [];
  const latestEcg = data?.ecg;
  const hasClinicalData = Boolean(data?.hasClinicalData);
  const displayRisk = risk?.overallRiskLevel || 'NOT ASSESSED';
  const displayHeartRate = latestEcg?.heartRateBpm ?? latestVitals.heartRate?.currentBpm;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome & Health Score Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-cardio-900 via-navy-900 to-navy-950 text-white rounded-3xl border border-sky-900/60 shadow-lg relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Cardiovascular Twin Baseline</span>
            <Badge variant={risk.overallRiskLevel === 'HIGH' ? 'high' : risk.overallRiskLevel === 'MEDIUM' ? 'medium' : 'low'} size="sm">
              {displayRisk}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.fullName?.split(' ')[0] || 'Patient'}
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            {data?.worldModelOverview?.narrative || (hasClinicalData ? 'Your longitudinal cardiac parameters are synchronized with your care team.' : 'No clinical data has been recorded yet. Upload a report or log a vital to begin your baseline.')}
          </p>
        </div>

        {/* Health Score Readout */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-xl text-white shadow-md">
            {hasClinicalData && profile.currentHealthScore ? profile.currentHealthScore : '--'}
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Health Index</span>
            <p className="text-sm font-extrabold text-white">{hasClinicalData ? 'Current Index' : 'Awaiting baseline'}</p>
            <span className="text-[10px] text-emerald-300">{hasClinicalData ? 'Based on recorded clinical data' : 'Upload data to calculate'}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsUploadModalOpen(true)}
          icon={<Upload className="w-4 h-4" />}
        >
          Upload Report / ECG
        </Button>

        <Link to="/patient/assistant">
          <Button variant="danger" size="sm" icon={<Activity className="w-4 h-4" />}>
            Report Symptoms
          </Button>
        </Link>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsManualVitalsOpen(true)}
          icon={<Plus className="w-4 h-4 text-cardio-600" />}
        >
          Log Vitals
        </Button>

        <Link to="/patient/assistant">
          <Button variant="outline" size="sm" icon={<Sparkles className="w-4 h-4 text-sky-500" />}>
            Ask AI Assistant
          </Button>
        </Link>

        <Link to="/patient/timeline">
          <Button variant="ghost" size="sm" icon={<GitCommit className="w-4 h-4" />}>
            View World Model Timeline
          </Button>
        </Link>
      </div>

      {/* Apple Health-Style Vitals Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Heart Rate"
          value={displayHeartRate ?? '--'}
          unit={displayHeartRate != null ? 'BPM' : ''}
          trend="neutral"
          trendLabel={latestEcg ? 'From uploaded ECG' : latestVitals.heartRate?.currentBpm ? 'Wearable reading' : 'No reading yet'}
          accentColor="rose"
          icon={<Heart className="w-5 h-5" />}
          statusBadge={{ label: 'Normal Sinus', variant: 'low' }}
        />

        <StatCard
          title="Blood Pressure"
          value={latestVitals.bloodPressure ? `${latestVitals.bloodPressure.systolic}/${latestVitals.bloodPressure.diastolic}` : '--'}
          unit={latestVitals.bloodPressure ? 'mmHg' : ''}
          trend={latestVitals.bloodPressure?.systolic > 130 ? 'up' : 'down'}
          trendLabel={latestVitals.bloodPressure?.category || 'No reading yet'}
          accentColor="cardio"
          icon={<Activity className="w-5 h-5" />}
          statusBadge={{
            label: latestVitals.bloodPressure?.category || 'Awaiting data',
            variant: latestVitals.bloodPressure?.systolic > 140 ? 'high' : latestVitals.bloodPressure?.systolic > 130 ? 'medium' : 'low',
          }}
        />

        <StatCard
          title="Oxygen Saturation"
          value={latestVitals.oxygenSaturation?.spo2Percentage ?? '--'}
          unit={latestVitals.oxygenSaturation?.spo2Percentage ? '%' : ''}
          subtext={latestVitals.oxygenSaturation?.spo2Percentage ? 'Latest reading' : 'No reading yet'}
          accentColor="emerald"
          icon={<Gauge className="w-5 h-5" />}
          statusBadge={{ label: latestVitals.oxygenSaturation?.spo2Percentage ? 'Recorded' : 'Awaiting data', variant: latestVitals.oxygenSaturation?.spo2Percentage ? 'success' : 'info' }}
        />

        <StatCard
          title="Medication Adherence"
          value={data?.adherencePercentage != null ? `${data.adherencePercentage}%` : '--'}
          subtext={medications.length ? `${medications.length} Active Prescriptions` : 'No medications recorded'}
          accentColor="indigo"
          icon={<Pill className="w-5 h-5" />}
          statusBadge={{ label: data?.adherencePercentage != null ? 'Target: >90%' : 'Awaiting data', variant: data?.adherencePercentage != null ? 'low' : 'info' }}
        />
      </div>

      {/* Main Clinical Intelligence Grid (ECG Canvas, Risk Gauge, Trends) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live ECG & Vitals Longitudinal Trends */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live ECG Rhythm Strip */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Real-Time Diagnostic ECG</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {latestEcg
                    ? `Latest uploaded ECG: ${new Date(latestEcg.recordDate).toLocaleDateString()}`
                    : 'Continuous telemetric lead strip'}
                </p>
              </div>
              <Link to="/patient/ecgs" className="text-xs font-semibold text-cardio-600 dark:text-cardio-400 hover:underline flex items-center gap-1">
                Full 12-Lead Analysis <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {latestEcg?.measurementsAvailable ? (
              <ECGWaveformCanvas
                waveformPoints={latestEcg.waveformPoints}
                heartRate={latestEcg.heartRateBpm}
                prIntervalMs={latestEcg.prIntervalMs}
                qrsDurationMs={latestEcg.qrsDurationMs}
                qtcIntervalMs={latestEcg.qtcIntervalMs}
                rhythm={latestEcg.rhythm}
              />
            ) : latestEcg ? (
              <Card>
                <CardContent>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This ECG has qualitative findings but no numeric readings in the uploaded document.
                  </p>
                  {latestEcg.abnormalities?.length > 0 && (
                    <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      Findings: {latestEcg.abnormalities.join('; ')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Upload an ECG report to populate this section.</p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent>
                {latestEcg ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    {[
                      ['Heart Rate', latestEcg.measurementsAvailable ? `${latestEcg.heartRateBpm} bpm` : 'Not measured'],
                      ['PR', latestEcg.measurementsAvailable ? `${latestEcg.prIntervalMs} ms` : 'Not measured'],
                      ['QRS', latestEcg.measurementsAvailable ? `${latestEcg.qrsDurationMs} ms` : 'Not measured'],
                      ['QTc', latestEcg.measurementsAvailable ? `${latestEcg.qtcIntervalMs} ms` : 'Not measured'],
                      ['Rhythm', latestEcg.rhythm],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-slate-50 dark:bg-navy-900 px-2 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
                        <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Upload an ECG report to populate the latest analysis.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Longitudinal Blood Pressure & Heart Rate Trends */}
          <Card>
            <CardHeader
              title="14-Day Hemodynamic Vitals Trend"
              subtitle="Systolic / Diastolic & Heart Rate vs Guideline Targets"
              icon={<Activity className="w-5 h-5 text-cardio-600" />}
              action={
                <Link to="/patient/wearables" className="text-xs font-semibold text-cardio-600 dark:text-cardio-400 hover:underline">
                  View Analytics
                </Link>
              }
            />
            <CardContent className="space-y-6">
              <BloodPressureChart data={data?.vitals?.history || []} height={200} />
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Cardiovascular Risk Stratification & Adherence */}
        <div className="space-y-6">
          <RiskScoreGauge risk={risk} />

          {/* Adherence Weekly Bar Card */}
          <Card>
            <CardHeader
              title="Weekly Medication Compliance"
              subtitle="Guideline-directed daily dosing"
              icon={<Pill className="w-5 h-5 text-indigo-600" />}
            />
            <CardContent>
              {medications.length ? <AdherenceBarChart /> : <p className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">Adherence trends will appear after medications are added.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Active Medications & Upcoming Investigations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medications Checklist */}
        <Card>
          <CardHeader
            title="Today's Prescriptions & Schedule"
            subtitle="Track and log daily doses"
            icon={<Pill className="w-5 h-5 text-indigo-600" />}
            action={
              <Link to="/patient/medications" className="text-xs font-semibold text-cardio-600 hover:underline">
                Manage List
              </Link>
            }
          />
          <CardContent className="space-y-3">
            {medications.length > 0 ? (
              medications.map((med: any) => (
                <div
                  key={med._id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-900/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white">{med.name}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {med.dosage} • {med.frequency} • {med.foodInstructions}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleMedicationLog(med._id, 'morning', 'taken')}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-200 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Take
                    </button>
                    <button
                      onClick={() => handleMedicationLog(med._id, 'morning', 'missed')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 transition-colors"
                    >
                      Miss
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No active medications prescribed.</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Investigations & Recommended Tests */}
        <Card>
          <CardHeader
            title="Adaptive Investigations & Diagnostic Tests"
            subtitle="AI & Clinician ordered evaluations"
            icon={<Calendar className="w-5 h-5 text-cardio-600" />}
          />
          <CardContent className="space-y-3">
            {investigations.length > 0 ? (
              investigations.map((inv: any) => (
                <div
                  key={inv._id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-900/70 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{inv.testName}</span>
                    <Badge variant={inv.priority === 'Urgent' ? 'high' : 'info'} size="sm">
                      {inv.priority}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{inv.aiRationale}</p>
                  {inv.clinicalGuidelineReference && (
                    <span className="inline-block text-[10px] font-mono text-sky-600 dark:text-sky-400">
                      Ref: {inv.clinicalGuidelineReference}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">All diagnostic investigations are up to date.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Cardiovascular Medical Document"
        subtitle="Ingest PDF or image reports for automated OCR and timeline update."
        maxWidth="lg"
      >
        <DocumentUploader onUploadSuccess={handleUploadComplete} />
      </Modal>

      {/* OCR Extraction Confirmation Modal */}
      <OCRConfirmationModal
        isOpen={isOcrConfirmOpen}
        onClose={() => setIsOcrConfirmOpen(false)}
        report={extractedReport}
        ecg={extractedEcg}
        onConfirm={() => {
          addToast({
            type: 'success',
            title: 'World Model Synchronized',
            message: 'Extracted clinical values added to your longitudinal timeline.',
          });
        }}
      />

      {/* Manual Vitals Modal */}
      <Modal
        isOpen={isManualVitalsOpen}
        onClose={() => setIsManualVitalsOpen(false)}
        title="Record Manual Vitals"
        subtitle="Log home blood pressure cuff or pulse oximeter readings."
        maxWidth="md"
      >
        <form onSubmit={handleManualVitalsSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                required
                value={manualVitals.systolic}
                onChange={(e) => setManualVitals({ ...manualVitals, systolic: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                required
                value={manualVitals.diastolic}
                onChange={(e) => setManualVitals({ ...manualVitals, diastolic: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Heart Rate (BPM)</label>
              <input
                type="number"
                required
                value={manualVitals.heartRate}
                onChange={(e) => setManualVitals({ ...manualVitals, heartRate: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Oxygen Saturation (%)</label>
              <input
                type="number"
                required
                value={manualVitals.spo2}
                onChange={(e) => setManualVitals({ ...manualVitals, spo2: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsManualVitalsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Vitals
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

