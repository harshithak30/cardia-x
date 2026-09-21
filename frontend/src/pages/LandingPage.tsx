import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  Activity,
  ShieldAlert,
  Brain,
  FileSearch,
  CheckCircle2,
  Stethoscope,
  Shield,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  Sparkles,
  Users,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white selection:bg-cardio-500 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-cardio-100/40 via-sky-50/20 to-transparent dark:from-cardio-950/30 dark:via-transparent pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cardio-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-cardio-500/25">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight">CARDIA-X</span>
            <span className="text-[10px] font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
              Multimodal AI Cardiology Platform
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-cardio-600 dark:hover:text-cardio-400 transition-colors">
            Platform Capabilities
          </a>
          <a href="#agents" className="hover:text-cardio-600 dark:hover:text-cardio-400 transition-colors">
            AI Multi-Agent Core
          </a>
          <a href="#how-it-works" className="hover:text-cardio-600 dark:hover:text-cardio-400 transition-colors">
            Longitudinal Model
          </a>
          <a href="#testimonials" className="hover:text-cardio-600 dark:hover:text-cardio-400 transition-colors">
            Clinical Outcomes
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/patient/login">
            <Button variant="secondary" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/patient/signup">
            <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cardio-50 dark:bg-cardio-950/60 border border-cardio-200 dark:border-cardio-800 text-cardio-700 dark:text-cardio-300 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-cardio-500" />
          Next-Generation Risk-Adaptive Cardiovascular AI Care
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-slate-900 dark:text-white">
          Continuous Heart Health Care.{' '}
          <span className="bg-gradient-to-r from-cardio-600 via-sky-500 to-teal-400 bg-clip-text text-transparent">
            Powered by Clinical AI.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          CARDIA-X is a hospital-grade multimodal platform that continuously evaluates your cardiovascular baseline, detects subtle health deterioration, coordinates diagnostic investigations, and assists cardiologists in longitudinal patient care.
        </p>

        {/* 3 Main Role CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
          <Link to="/patient/login" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-lg shadow-cardio-500/25"
              icon={<Activity className="w-5 h-5" />}
            >
              Continue as Patient
            </Button>
          </Link>

          <Link to="/doctor/login" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              icon={<Stethoscope className="w-5 h-5 text-cardio-600" />}
            >
              Continue as Doctor
            </Button>
          </Link>

          <Link to="/admin/login" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto text-slate-500 hover:text-slate-800 dark:hover:text-white"
              icon={<Shield className="w-4 h-4 text-slate-400" />}
            >
              Admin Portal
            </Button>
          </Link>
        </div>

      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center space-y-3 mb-16">
          <Badge variant="info" size="md">
            Hospital-Grade Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            End-to-End Longitudinal Cardiology Suite
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Designed for chronic cardiovascular disease prevention, acute event triage, and outpatient management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 bg-white dark:bg-navy-850 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cardio-50 dark:bg-cardio-950/60 text-cardio-600 dark:text-cardio-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">12-Lead ECG Intelligence</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Automatic interval measurement (PR, QRS, QTc), arrhythmia categorization, and longitudinal baseline delta tracking over months of historical tracings.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-white dark:bg-navy-850 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Document Vision OCR</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Upload blood tests, echocardiograms, and prescriptions in PDF or image formats. Vision-language models extract structured laboratory parameters and doses.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-white dark:bg-navy-850 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clinician Approval Gate</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Every high-risk AI recommendation (medication alterations, urgent diagnostics) requires explicit physician verification and signature before execution.
            </p>
          </div>
        </div>
      </section>

      {/* 9 Multi-Agent Architecture Section */}
      <section id="agents" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-100/60 dark:bg-navy-900/50 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 mb-20">
        <div className="text-center space-y-3 mb-16">
          <Badge variant="success" size="md">
            AI Multi-Agent System
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Coordinated by Care Orchestrator
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            9 specialized clinical intelligence agents working in synergy to maintain the Cardiovascular Patient World Model.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Care Orchestrator', desc: 'Central controller receiving telemetry, delegating tasks, and updating world model state.', icon: Cpu },
            { title: 'Document Intelligence', desc: 'Multimodal OCR and structured extraction of lab biomarkers, echocardiography, and notes.', icon: FileSearch },
            { title: 'ECG Analysis Agent', desc: 'Longitudinal waveform analysis, interval calculation, and arrhythmia classification.', icon: Activity },
            { title: 'Medication Agent', desc: 'Checks drug-drug interactions, duplicate therapeutic classes, and adherence schedules.', icon: CheckCircle2 },
            { title: 'Symptom Agent', desc: 'Guided natural language interview collecting duration, radiation, and cardiac red flags.', icon: HeartPulse },
            { title: 'Risk Monitoring Agent', desc: 'Framingham and ASCVD risk stratification with dynamic deterioration detection.', icon: TrendingUp },
            { title: 'Investigation Engine', desc: 'Identifies diagnostic gaps and recommends targeted tests (Troponin, Echo, Holter).', icon: Brain },
            { title: 'Evidence Agent (RAG)', desc: 'Grounds advice in ACC, AHA, and ESC practice guidelines with verified citations.', icon: Sparkles },
            { title: 'Safety Agent', desc: 'Enforces clinical safety guardrails and prevents unverified high-risk actions.', icon: Shield },
          ].map((agent, idx) => {
            const Icon = agent.icon;
            return (
              <div key={idx} className="p-6 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cardio-50 dark:bg-cardio-950 text-cardio-600 dark:text-cardio-400 flex items-center justify-center font-bold">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{agent.title}</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{agent.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-cardio-600" />
          <span className="font-bold text-slate-800 dark:text-slate-200">CARDIA-X Longitudinal AI Platform</span>
          <span>© 2026. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-500" /> HIPAA & Clinical Guideline Compliant</span>
          <span>Terms of Clinical Use</span>
          <span>Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
};

