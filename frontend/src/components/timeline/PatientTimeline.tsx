import React, { useState } from 'react';
import { TimelineEvent } from '../../types';
import { Badge } from '../common/Badge';
import {
  Activity,
  FileText,
  Pill,
  MessageSquare,
  Watch,
  Stethoscope,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Filter,
} from 'lucide-react';

interface PatientTimelineProps {
  events: TimelineEvent[];
  onSelectEvent?: (event: TimelineEvent) => void;
}

export const PatientTimeline: React.FC<PatientTimelineProps> = ({ events, onSelectEvent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'All Events' },
    { id: 'ECG', label: 'ECG Tracings' },
    { id: 'Lab', label: 'Lab Reports' },
    { id: 'Medication', label: 'Medications' },
    { id: 'Symptom', label: 'Symptoms' },
    { id: 'Vitals', label: 'Wearable Alerts' },
    { id: 'Doctor', label: 'Doctor Notes' },
  ];

  const filteredEvents = selectedCategory === 'ALL'
    ? events
    : events.filter((e) => e.category?.toLowerCase() === selectedCategory.toLowerCase());

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ECG':
        return <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Lab':
        return <FileText className="w-4 h-4 text-cardio-600 dark:text-cardio-400" />;
      case 'Medication':
        return <Pill className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'Symptom':
        return <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Vitals':
      case 'Alert':
        return <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'Doctor':
        return <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getIconBg = (category: string) => {
    switch (category) {
      case 'ECG':
        return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800';
      case 'Lab':
        return 'bg-cardio-50 border-cardio-200 dark:bg-cardio-950/50 dark:border-cardio-800';
      case 'Medication':
        return 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800';
      case 'Symptom':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800';
      case 'Vitals':
      case 'Alert':
        return 'bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:border-rose-800';
      case 'Doctor':
        return 'bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:border-teal-800';
      default:
        return 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-cardio-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {filteredEvents.map((evt, idx) => (
          <div
            key={evt.id || idx}
            onClick={() => onSelectEvent && onSelectEvent(evt)}
            className="relative group transition-all"
          >
            {/* Dot / Icon */}
            <div
              className={`absolute -left-6 top-1 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110 ${getIconBg(
                evt.category
              )}`}
            >
              {getCategoryIcon(evt.category)}
            </div>

            {/* Event Card */}
            <div className="ml-3 p-4 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:shadow-card hover:border-cardio-400/40 transition-all">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{evt.category}</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{evt.title}</h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {evt.severity && (
                    <Badge
                      variant={evt.severity === 'critical' ? 'high' : evt.severity === 'moderate' ? 'medium' : 'low'}
                      size="sm"
                    >
                      {evt.severity.toUpperCase()}
                    </Badge>
                  )}
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(evt.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{evt.summary}</p>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center">No timeline records found for this category filter.</p>
        )}
      </div>
    </div>
  );
};

