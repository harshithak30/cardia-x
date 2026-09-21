import React, { useEffect, useState } from 'react';
import { doctorApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { RecommendationApprovalModal } from '../../components/doctor/RecommendationApprovalModal';
import { CheckSquare, ShieldCheck, AlertTriangle, FileText, Activity } from 'lucide-react';

export const DoctorApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalModal, setApprovalModal] = useState<{ isOpen: boolean; type: 'risk' | 'investigation'; item: any }>({
    isOpen: false,
    type: 'risk',
    item: null,
  });
  const { addToast } = useNotification();

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.getDashboard();
      if (res.success) {
        setApprovals(res.summary?.pendingApprovals || []);
        setInvestigations(res.summary?.pendingInvestigations || []);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Physician AI Recommendation Approval Queue</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Clinical safety gate: High-risk treatment recommendations and diagnostic test orders require clinician authorization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Alerts */}
        <Card>
          <CardHeader
            title="Cardiovascular Risk Alerts"
            subtitle="Clinical escalation recommendations"
            icon={<ShieldCheck className="w-5 h-5 text-rose-500" />}
          />
          <CardContent className="space-y-4 text-xs">
            {approvals.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{item.patientId?.fullName}</span>
                  <Badge variant="high" size="sm">Risk Score: {item.riskScore}</Badge>
                </div>
                <p className="text-slate-600 dark:text-slate-300 bg-white dark:bg-navy-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  {item.deteriorationReason || item.recommendedActions?.join('; ')}
                </p>
                <div className="flex justify-end pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setApprovalModal({ isOpen: true, type: 'risk', item })}
                  >
                    Review & Sign
                  </Button>
                </div>
              </div>
            ))}

            {approvals.length === 0 && <p className="text-slate-400 py-8 text-center">No pending risk alerts.</p>}
          </CardContent>
        </Card>

        {/* Diagnostic Orders */}
        <Card>
          <CardHeader
            title="Diagnostic Test Recommendations"
            subtitle="Adaptive investigation engine orders"
            icon={<Activity className="w-5 h-5 text-cardio-600" />}
          />
          <CardContent className="space-y-4 text-xs">
            {investigations.map((inv) => (
              <div
                key={inv._id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{inv.testName}</span>
                  <Badge variant={inv.priority === 'Urgent' ? 'high' : 'info'} size="sm">
                    {inv.priority}
                  </Badge>
                </div>
                <p className="text-slate-600 dark:text-slate-300 bg-white dark:bg-navy-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  {inv.aiRationale}
                </p>
                <div className="flex justify-end pt-1">
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

            {investigations.length === 0 && <p className="text-slate-400 py-8 text-center">No pending test orders.</p>}
          </CardContent>
        </Card>
      </div>

      <RecommendationApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ ...approvalModal, isOpen: false })}
        type={approvalModal.type}
        item={approvalModal.item}
        onSuccess={() => fetchApprovals()}
      />
    </div>
  );
};

