import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  FileText,
  Activity,
  Pill,
  Watch,
  GitCommit,
  Bot,
  Users,
  CheckSquare,
  ShieldCheck,
  Cpu,
  BookOpen,
  MessageSquarePlus,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const patientNavItems = [
    { name: 'Health Overview', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Patient Profile', path: '/patient/profile', icon: User },
    { name: 'Medical Reports & OCR', path: '/patient/reports', icon: FileText },
    { name: '12-Lead ECG Analysis', path: '/patient/ecgs', icon: Activity },
    { name: 'Medications & Adherence', path: '/patient/medications', icon: Pill },
    { name: 'Wearables & Vitals', path: '/patient/wearables', icon: Watch },
    { name: 'World Model Timeline', path: '/patient/timeline', icon: GitCommit },
    { name: 'AI Health Assistant', path: '/patient/assistant', icon: Bot },
  ];

  const doctorNavItems = [
    { name: 'Clinical Overview', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Patients (360°)', path: '/doctor/patients', icon: Users },
    { name: 'AI Approvals Queue', path: '/doctor/approvals', icon: CheckSquare },
    { name: 'Clinical Guidelines', path: '/doctor/guidelines', icon: BookOpen },
  ];

  const adminNavItems = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Doctor Verifications', path: '/admin/verifications', icon: ShieldCheck },
    { name: 'AI Agent Monitor & Logs', path: '/admin/agents', icon: Cpu },
    { name: 'Guideline Knowledge Base', path: '/admin/guidelines', icon: BookOpen },
  ];

  const navItems = role === 'doctor' ? doctorNavItems : role === 'admin' ? adminNavItems : patientNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 bg-white dark:bg-navy-900 border-r border-slate-200/80 dark:border-slate-800/80 p-4 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {role === 'doctor' ? 'Clinical Navigation' : role === 'admin' ? 'Administration' : 'Cardiovascular Care'}
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-cardio-50 dark:bg-cardio-950/50 text-cardio-700 dark:text-cardio-300 border border-cardio-200 dark:border-cardio-800 shadow-subtle'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-850 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Card for AI Symptom Triage quick action */}
          {role === 'patient' && (
            <div className="p-3.5 bg-gradient-to-br from-cardio-900 to-navy-950 text-white rounded-2xl border border-sky-800/50 shadow-md">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-pulse-500 flex items-center justify-center text-white">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs">Experiencing Symptoms?</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug mb-3">
                Report chest discomfort or palpitations for immediate AI clinical triage.
              </p>
              <NavLink
                to="/patient/assistant"
                onClick={onClose}
                className="w-full py-1.5 px-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-cardio-600" />
                Report Symptoms
              </NavLink>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

