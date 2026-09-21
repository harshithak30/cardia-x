import React, { useState } from 'react';
import { SymptomTriageBot } from '../../components/chat/SymptomTriageBot';
import { EvidenceRAGAssistant } from '../../components/chat/EvidenceRAGAssistant';
import { Sparkles, HeartCrack, BookOpen, ShieldCheck, Activity } from 'lucide-react';

export const AICareAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'evidence'>('symptoms');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cardiovascular AI Health Suite</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive multi-agent clinical consultation and symptom triage.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-navy-850 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('symptoms')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'symptoms'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HeartCrack className="w-4 h-4" />
            Symptom Triage Bot
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'evidence'
                ? 'bg-cardio-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Evidence RAG Assistant
          </button>
        </div>
      </div>

      {/* Render Active AI Agent */}
      {activeTab === 'symptoms' ? <SymptomTriageBot /> : <EvidenceRAGAssistant />}
    </div>
  );
};

