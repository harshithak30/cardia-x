import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { doctorApi } from '../../api';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { RecommendationApprovalModal } from '../../components/doctor/RecommendationApprovalModal';
import {
  Users,
  ShieldAlert,
  CheckSquare,
  Bell,
  Stethoscope,
  Activity,
  ArrowRight,
  Search,
  Eye,
  Calendar,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Approval Modal
  const [approvalModal, setApprovalModal] = useState<{ isOpen: boolean; type: 'risk' | 'investigation'; item: any }>({
    isOpen: false,
    type: 'risk',
    item: null,
  });

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.getDashboard();
      if (res.success) {
        setSummary(res.summary);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error loading dashboard', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-navy-950 via-navy-900 to-teal-950 text-white rounded-3xl border border-teal-900/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Cardiology Clinical Station</span>
            <Badge variant="success" size="sm">
              ON-CALL ACTIVE
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.fullName || 'Dr. Robert Chen, MD'}
          </h1>
          <p className="text-xs text-slate-300">
            Cardia-X Advanced Heart Specialty Institute • Longitudinal Triage & AI Coordination
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/doctor/patients">
            <Button variant="vital" size="md" icon={<Users className="w-4 h-4" />}>
              Patient Directory (360°)
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assigned Patients"
          value={summary?.totalPatients ?? 0}
          subtext="Active ambulatory tracking"
          accentColor="cardio"
          icon={<Users className="w-5 h-5" />}
        />

        <StatCard
          title="High Risk Patients"
          value={summary?.highRiskCount ?? 0}
          trend="up"
          trendLabel="Immediate review needed"
          accentColor="rose"
          icon={<ShieldAlert className="w-5 h-5" />}
          statusBadge={{ label: 'URGENT', variant: 'high' }}
        />

        <StatCard
          title="Pending AI Approvals"
          value={summary?.pendingApprovalsCount ?? 0}
          subtext="Clinician gates awaiting sign-off"
          accentColor="amber"
          icon={<CheckSquare className="w-5 h-5" />}
          statusBadge={{ label: 'GATE ACTIVE', variant: 'medium' }}
        />

        <StatCard
          title="Today's Cardiac Alerts"
          value={summary?.todayAlertsCount ?? 0}
          subtext="Vitals spikes & rhythm anomalies"
          accentColor="indigo"
          icon={<Bell className="w-5 h-5" />}
        />
      </div>

      {/* Main Clinical Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending AI Recommendation Approvals */}
        <Card>
          <CardHeader
            title="Pending AI Recommendation Review Queue"
            subtitle="Clinical guardrails requiring registered physician sign-off"
            icon={<CheckSquare className="w-5 h-5 text-amber-500" />}
            action={
              <Link to="/doctor/approvals" className="text-xs font-semibold text-cardio-600 hover:underline">
                View All
              </Link>
            }
          />
          <CardContent className="space-y-4">
            {summary?.pendingApprovals?.map((item: any) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Patient: {item.patientId?.fullName || 'Assigned patient'}
                    </span>
                    <p className="text-[11px] text-slate-400">Risk Score: {item.riskScore}/100 • High Risk</p>
                  </div>
                  <Badge variant="high" size="sm">
                    ACTION PENDING
                  </Badge>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-navy-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  {item.deteriorationReason || item.recommendedActions?.join('; ')}
                </p>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setApprovalModal({ isOpen: true, type: 'risk', item })}
                  >
                    Review & Authorize
                  </Button>
                </div>
              </div>
            ))}

            {summary?.pendingInvestigations?.map((inv: any) => (
              <div
                key={inv._id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Order: {inv.testName}
                    </span>
                    <p className="text-[11px] text-slate-400">Patient: {inv.patientId?.fullName || 'Assigned patient'}</p>
                  </div>
                  <Badge variant={inv.priority === 'Urgent' ? 'high' : 'info'} size="sm">
                    {inv.priority}
                  </Badge>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-navy-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  {inv.aiRationale}
                </p>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="vital"
                    size="sm"
                    onClick={() => setApprovalModal({ isOpen: true, type: 'investigation', item: inv })}
                  >
                    Authorize Order
                  </Button>
                </div>
              </div>
            ))}

            {(!summary?.pendingApprovals || summary.pendingApprovals.length === 0) &&
              (!summary?.pendingInvestigations || summary.pendingInvestigations.length === 0) && (
                <p className="text-xs text-slate-400 text-center py-8">Approval queue is completely cleared.</p>
              )}
          </CardContent>
        </Card>

        {/* Priority Triage Patients */}
        <Card>
          <CardHeader
            title="High-Acuity Cardiovascular Triage"
            subtitle="Patients exhibiting physiological deterioration or abnormal ECG"
            icon={<ShieldAlert className="w-5 h-5 text-rose-500" />}
            action={
              <Link to="/doctor/patients" className="text-xs font-semibold text-cardio-600 hover:underline">
                Full Directory
              </Link>
            }
          />
          <CardContent className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-sm text-rose-900 dark:text-rose-200">Marcus Vance (60M)</span>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300">CAD Status Post-LAD Stent (2024)</p>
                </div>
                <Badge variant="high" dot size="sm">
                  HIGH RISK (74/100)
                </Badge>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Recent ambulatory SBP spike (146 mmHg) and sub-target LDL-C (92 mg/dL). AI flagged potential need for statin titration.
              </p>

              <div className="pt-2 flex justify-end">
                <Link to="/doctor/patients">
                  <Button variant="danger" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                    Open 360° Dossier
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-sm text-amber-900 dark:text-amber-200">Elena Rostova (54F)</span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">Paroxysmal Atrial Fibrillation</p>
                </div>
                <Badge variant="medium" dot size="sm">
                  MEDIUM RISK
                </Badge>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Reported intermittent palpitations. 24-Hour Holter monitoring pending scheduling.
              </p>

              <div className="pt-2 flex justify-end">
                <Link to="/doctor/patients">
                  <Button variant="secondary" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                    Open 360° Dossier
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Modal */}
      <RecommendationApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ ...approvalModal, isOpen: false })}
        type={approvalModal.type}
        item={approvalModal.item}
        onSuccess={() => {
          fetchSummary();
        }}
      />
    </div>
  );
};

