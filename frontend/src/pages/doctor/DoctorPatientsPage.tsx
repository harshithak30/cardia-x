import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PatientProfile } from '../../types';
import {
  Users,
  Search,
  Filter,
  Eye,
  Activity,
  Heart,
  Calendar,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export const DoctorPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.getPatients({ search, riskLevel: riskFilter });
      if (res.success) {
        setPatients(res.patients);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [riskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assigned Patient Registry (360° View)</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select any patient to review their complete cardiovascular dossier, ECG intervals, lab trends, and world model timeline.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, diagnosis, or email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cardio-500"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                riskFilter === risk
                  ? 'bg-cardio-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {risk === 'ALL' ? 'All Tiers' : `${risk} RISK`}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {patients.map((patient: any) => {
          const u = patient.userId || {};
          const isHigh = patient.overallRiskLevel === 'HIGH';
          const isMedium = patient.overallRiskLevel === 'MEDIUM';

          return (
            <Card
              key={patient._id}
              hover
              onClick={() => navigate(`/doctor/patients/${u._id || patient.userId}`)}
              className="p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cardio-600 to-sky-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                      {u.fullName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{u.fullName}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {patient.age || 52} yrs • {patient.gender?.toUpperCase()} • {patient.bloodGroup}
                      </p>
                    </div>
                  </div>

                  <Badge variant={isHigh ? 'high' : isMedium ? 'medium' : 'low'} dot size="sm">
                    {patient.overallRiskLevel}
                  </Badge>
                </div>

                {/* Conditions Badges */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diagnoses & History</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.medicalHistory?.heartDiseases?.slice(0, 2).map((d: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-900 text-[11px] text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-800 truncate max-w-[200px]"
                      >
                        {d}
                      </span>
                    ))}
                    {patient.medicalHistory?.hasHypertension && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[11px] font-medium border border-rose-200 dark:border-rose-900">
                        HTN
                      </span>
                    )}
                    {patient.medicalHistory?.hasDiabetes && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[11px] font-medium border border-amber-200 dark:border-amber-900">
                        DM
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Score: <strong className={isHigh ? 'text-rose-500' : 'text-emerald-500'}>{patient.currentHealthScore}/100</strong>
                </span>
                <span className="text-cardio-600 dark:text-cardio-400 font-bold flex items-center gap-1">
                  Inspect Dossier <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          );
        })}

        {patients.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            No patient profiles matched the search criteria.
          </div>
        )}
      </div>
    </div>
  );
};

