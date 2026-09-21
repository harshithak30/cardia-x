import React, { useEffect, useState } from 'react';
import { patientApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { HeartRateChart } from '../../components/charts/HeartRateChart';
import { BloodPressureChart } from '../../components/charts/BloodPressureChart';
import { WearableMetric } from '../../types';
import {
  Watch,
  Heart,
  Activity,
  Gauge,
  Moon,
  Footprints,
  Flame,
  Plus,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export const WearablesMonitorPage: React.FC = () => {
  const [history, setHistory] = useState<WearableMetric[]>([]);
  const [latest, setLatest] = useState<WearableMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const { addToast } = useNotification();

  const [form, setForm] = useState({
    systolic: 122,
    diastolic: 80,
    heartRate: 72,
    spo2: 98,
    steps: 8200,
    sleepHours: 7.5,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await patientApi.getDashboard();
      if (res.success) {
        setHistory(res.dashboard.vitals.history || []);
        setLatest(res.dashboard.vitals.latest || null);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error loading vitals', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patientApi.addWearable({
        heartRate: { currentBpm: Number(form.heartRate) },
        bloodPressure: { systolic: Number(form.systolic), diastolic: Number(form.diastolic) },
        oxygenSaturation: { spo2Percentage: Number(form.spo2) },
        activity: { steps: Number(form.steps), activeCalories: 420 },
        sleep: { totalHours: Number(form.sleepHours) },
      });
      addToast({ type: 'success', title: 'Vitals Saved', message: 'Metrics synchronized to continuous telemetry.' });
      setIsManualModalOpen(false);
      fetchData();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wearable Telemetry & Continuous Vitals</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time biometric streams from Apple Health, Google Fit, and manual ambulatory monitors.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsManualModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Record Ambulatory Reading
        </Button>
      </div>

      {/* Vitals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Resting Heart Rate"
          value={latest?.heartRate?.restingBpm || 68}
          unit="BPM"
          trend="neutral"
          trendLabel="Within Baseline (60-100)"
          accentColor="rose"
          icon={<Heart className="w-5 h-5" />}
        />

        <StatCard
          title="Blood Pressure"
          value={`${latest?.bloodPressure?.systolic || 122}/${latest?.bloodPressure?.diastolic || 80}`}
          unit="mmHg"
          trend={latest?.bloodPressure?.systolic && latest.bloodPressure.systolic >= 140 ? 'up' : 'down'}
          trendLabel={latest?.bloodPressure?.category || 'Normal'}
          accentColor="cardio"
          icon={<Activity className="w-5 h-5" />}
        />

        <StatCard
          title="Oxygen Saturation"
          value={latest?.oxygenSaturation?.spo2Percentage || 98}
          unit="%"
          subtext="Healthy Arterial SpO2"
          accentColor="emerald"
          icon={<Gauge className="w-5 h-5" />}
        />

        <StatCard
          title="Daily Physical Activity"
          value={latest?.activity?.steps || 7850}
          unit="Steps"
          subtext="Goal: 8,000 steps"
          accentColor="indigo"
          icon={<Footprints className="w-5 h-5" />}
        />
      </div>

      {/* Chart Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Longitudinal Heart Rate & HRV"
            subtitle="Current, resting, and variability trends"
            icon={<Heart className="w-5 h-5 text-pulse-500" />}
          />
          <CardContent>
            <HeartRateChart data={history} height={260} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Continuous Blood Pressure Fluctuation"
            subtitle="Systolic / Diastolic vs AHA Hypertensive Thresholds"
            icon={<Activity className="w-5 h-5 text-cardio-600" />}
          />
          <CardContent>
            <BloodPressureChart data={history} height={260} />
          </CardContent>
        </Card>
      </div>

      {/* Manual Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Log Manual Physiological Vitals"
        subtitle="Record blood pressure cuff or pulse oximeter measurements."
        maxWidth="md"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                required
                value={form.systolic}
                onChange={(e) => setForm({ ...form, systolic: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                required
                value={form.diastolic}
                onChange={(e) => setForm({ ...form, diastolic: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Heart Rate (BPM)</label>
              <input
                type="number"
                required
                value={form.heartRate}
                onChange={(e) => setForm({ ...form, heartRate: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">SpO2 (%)</label>
              <input
                type="number"
                required
                value={form.spo2}
                onChange={(e) => setForm({ ...form, spo2: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsManualModalOpen(false)}>
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

