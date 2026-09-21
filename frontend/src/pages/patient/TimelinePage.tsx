import React, { useEffect, useState } from 'react';
import { patientApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { PatientTimeline } from '../../components/timeline/PatientTimeline';
import { TimelineEvent } from '../../types';
import { GitCommit, Activity, ShieldCheck, TrendingUp, Clock } from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const res = await patientApi.getTimeline();
      if (res.success) {
        setTimeline(res.timeline || []);
        setTrends(res.trends || {});
        setTotalEvents(res.totalEvents || 0);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-cardio-600 dark:text-cardio-400 uppercase tracking-widest">
            Continuous Longitudinal Memory
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cardiovascular Patient World Model</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Chronological timeline of all cardiac events, ECG tracings, biomarker panels, medication changes, and clinical consultations.
        </p>
      </div>

      {/* World Model Summary Box */}
      {trends && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-navy-900 to-navy-950 text-white border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">Longitudinal Trend Synthesizer</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Total Milestones: {totalEvents}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{trends.aiClinicalNarrative || 'Patient baseline remains stable with regular therapeutic compliance.'}"
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-slate-800">
            <div>
              <span className="text-slate-400 text-[11px] block">Heart Rate Vector</span>
              <span className="font-bold text-sky-400 uppercase">{trends.heartRateTrend || 'Stable'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Blood Pressure Trend</span>
              <span className="font-bold text-emerald-400 uppercase">{trends.bpTrend || 'Controlled'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Lipid Control</span>
              <span className="font-bold text-amber-400 uppercase">{trends.cholesterolTrend || 'Elevated'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Compliance Rate</span>
              <span className="font-bold text-teal-400 uppercase">{trends.adherenceTrend || 'Good'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Stream */}
      <Card>
        <CardHeader
          title="Chronological Health Event Log"
          subtitle="Click on any event to inspect clinical metadata and AI rationale"
          icon={<GitCommit className="w-5 h-5 text-cardio-600" />}
        />
        <CardContent>
          <PatientTimeline events={timeline} />
        </CardContent>
      </Card>
    </div>
  );
};

