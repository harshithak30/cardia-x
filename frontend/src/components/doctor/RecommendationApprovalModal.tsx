import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { doctorApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { ShieldCheck, CheckCircle2, XCircle, Edit3 } from 'lucide-react';

interface RecommendationApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'risk' | 'investigation';
  item: any;
  onSuccess: () => void;
}

export const RecommendationApprovalModal: React.FC<RecommendationApprovalModalProps> = ({
  isOpen,
  onClose,
  type,
  item,
  onSuccess,
}) => {
  const [action, setAction] = useState<'approved' | 'rejected' | 'modified'>('approved');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useNotification();

  if (!item) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await doctorApi.reviewRecommendation(type, item._id, { action, notes });
      addToast({
        type: 'success',
        title: 'Clinical Action Executed',
        message: `Recommendation was ${action} with physician audit trail.`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Review Submission Failed',
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Physician Review: AI Recommendation Gate"
      subtitle="High-risk recommendations mandate clinician verification before taking clinical effect."
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Recommendation Content */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cardio-600 dark:text-cardio-400 uppercase tracking-wider">
              {type === 'risk' ? 'Cardiovascular Risk Alert' : 'Diagnostic Investigation Order'}
            </span>
            <Badge variant="high" dot size="sm">
              Doctor Approval Required
            </Badge>
          </div>

          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {type === 'risk' ? item.deteriorationReason || 'Risk Escalation Protocol' : item.testName}
          </h4>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {type === 'risk' ? item.recommendedActions?.join('; ') : item.aiRationale}
          </p>

          {item.clinicalGuidelineReference && (
            <p className="text-[11px] font-mono text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 p-2 rounded-lg border border-sky-100 dark:border-sky-800">
              Reference: {item.clinicalGuidelineReference}
            </p>
          )}
        </div>

        {/* Action Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Physician Clinical Decision
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAction('approved')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                action === 'approved'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Approve Order
            </button>

            <button
              type="button"
              onClick={() => setAction('modified')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                action === 'modified'
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-700 dark:text-amber-300 shadow-sm'
                  : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="w-5 h-5 text-amber-500" />
              Modify Plan
            </button>

            <button
              type="button"
              onClick={() => setAction('rejected')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                action === 'rejected'
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-700 dark:text-rose-300 shadow-sm'
                  : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <XCircle className="w-5 h-5 text-rose-500" />
              Reject Order
            </button>
          </div>
        </div>

        {/* Doctor Clinical Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Clinical Justification & Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add physician directives, dosage adjustments, or rationale..."
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cardio-500 focus:outline-none text-slate-900 dark:text-white"
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={action === 'rejected' ? 'danger' : 'primary'}
            size="md"
            loading={submitting}
            onClick={handleSubmit}
            icon={<ShieldCheck className="w-4 h-4" />}
          >
            Sign & Submit Decision
          </Button>
        </div>
      </div>
    </Modal>
  );
};

