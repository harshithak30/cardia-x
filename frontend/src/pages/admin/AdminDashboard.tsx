import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Shield,
  Users,
  Stethoscope,
  Cpu,
  BookOpen,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error loading admin stats', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cardio-400 uppercase tracking-widest">Platform Governance</span>
            <Badge variant="high" size="sm">
              SUPERUSER ACTIVE
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">CARDIA-X Administrative Center</h1>
          <p className="text-xs text-slate-400">
            Multi-agent observability, clinical guidelines repository, and physician licensing verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/agents">
            <Button variant="primary" size="sm" icon={<Cpu className="w-4 h-4" />}>
              Live AI Agent Monitor
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Users"
          value={stats?.totalUsers || 6}
          subtext="Patients, Doctors & Admins"
          accentColor="cardio"
          icon={<Users className="w-5 h-5" />}
        />

        <StatCard
          title="Doctor Verifications"
          value={stats?.totalDoctors ?? 0}
          subtext={`${stats?.pendingDoctorsCount || 0} Pending Verification`}
          accentColor="emerald"
          icon={<Stethoscope className="w-5 h-5" />}
          statusBadge={{ label: 'ALL VERIFIED', variant: 'success' }}
        />

        <StatCard
          title="AI Workflows Orchestrated"
          value={stats?.totalWorkflows || 14}
          subtext="Multi-Agent Pipeline Traces"
          accentColor="indigo"
          icon={<Cpu className="w-5 h-5" />}
        />

        <StatCard
          title="Clinical Guidelines (RAG)"
          value={stats?.totalGuidelines || 7}
          subtext="ACC / AHA / ESC Standards"
          accentColor="amber"
          icon={<BookOpen className="w-5 h-5" />}
        />
      </div>

      {/* Recent AI Workflow Traces & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Recent AI Multi-Agent Workflow Traces"
            subtitle="Real-time execution telemetry"
            icon={<Cpu className="w-5 h-5 text-indigo-600" />}
            action={
              <Link to="/admin/agents" className="text-xs font-semibold text-cardio-600 hover:underline">
                View Traces
              </Link>
            }
          />
          <CardContent className="space-y-3 text-xs">
            {stats?.recentWorkflows?.slice(0, 5).map((wf: any) => (
              <div
                key={wf._id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{wf.triggerEvent}</span>
                  <Badge variant={wf.status === 'completed' ? 'low' : 'medium'} size="sm">
                    {wf.status?.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Agents: {wf.agentTraces?.map((t: any) => t.agentName).join(' → ') || 'CareOrchestrator'}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">{wf.finalOutput}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card>
          <CardHeader
            title="System Security & Access Audit Log"
            subtitle="Immutable access & action records"
            icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
          />
          <CardContent className="space-y-2 text-xs">
            {stats?.recentAuditLogs?.slice(0, 7).map((log: any) => (
              <div
                key={log._id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between font-mono text-[11px]"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                  <span className="text-slate-400 ml-2">by {log.userRole?.toUpperCase()}</span>
                </div>
                <span className="text-slate-400 text-[10px]">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

