import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { AIWorkflow } from '../../types';
import { Cpu, Activity, ShieldCheck, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AIAgentMonitorPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStats();
      if (res.success) {
        setWorkflows(res.stats?.recentWorkflows || []);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Multi-Agent Execution Observability</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Inspect real-time agent coordination traces, latency metrics, and clinical safety decisions across all 9 agents.
        </p>
      </div>

      <div className="space-y-4">
        {workflows.map((wf) => (
          <Card key={wf._id} className="p-5 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{wf.triggerEvent}</span>
                  <Badge variant={wf.status === 'completed' ? 'low' : 'medium'} size="sm">
                    {wf.status?.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-[11px] font-mono text-slate-400">Workflow ID: {wf.workflowId}</p>
              </div>

              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(wf.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Agent Execution Traces Pipeline */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Agent Trace Trajectory ({wf.agentTraces?.length || 0} Agents)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {wf.agentTraces?.map((trace, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-cardio-600 dark:text-cardio-400">{trace.agentName}</span>
                      <span className="font-mono text-slate-400">{trace.durationMs}ms</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold">{trace.action}</p>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">{trace.outputSummary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Check Guardrail */}
            {wf.safetyCheck && (
              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Safety Guardrail:</span>
                  <span className="text-slate-600 dark:text-slate-400">{wf.safetyCheck.reason}</span>
                </div>
                <Badge variant={wf.safetyCheck.requiresHumanReview ? 'high' : 'low'} size="sm">
                  {wf.safetyCheck.requiresHumanReview ? 'CLINICIAN GATE' : 'AUTO PASS'}
                </Badge>
              </div>
            )}
          </Card>
        ))}

        {workflows.length === 0 && !loading && (
          <p className="text-slate-400 py-12 text-center text-xs">No multi-agent workflow traces recorded yet.</p>
        )}
      </div>
    </div>
  );
};

