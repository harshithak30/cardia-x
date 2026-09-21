import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { aiApi } from '../../api';
import {
  Send,
  Bot,
  User,
  AlertTriangle,
  HeartCrack,
  Activity,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  triage?: any;
}

export const SymptomTriageBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I am your CARDIA-X Symptom Intelligence Agent. If you are experiencing any chest pain, shortness of breath, palpitations, or lightheadedness, please describe your sensation. I'll help assess your cardiovascular safety.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTriage, setCurrentTriage] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await aiApi.symptomChat({
        message: userMsg,
        history: newHistory,
      });

      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.reply,
            triage: res.triage,
          },
        ]);
        if (res.triage) {
          setCurrentTriage(res.triage);
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an error analyzing your symptoms. If this is an emergency, please dial 911 or visit the nearest emergency room.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <div className="flex flex-col h-[640px] bg-white dark:bg-navy-850 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-4 px-6 bg-slate-50 dark:bg-navy-900 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pulse-500 to-rose-600 text-white flex items-center justify-center shadow-sm">
            <HeartCrack className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Symptom Intelligence & Triage</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Cardiovascular Risk-Adaptive Follow-up</p>
          </div>
        </div>

        {currentTriage && (
          <Badge
            variant={
              currentTriage.triageSeverity === 'EMERGENCY'
                ? 'critical'
                : currentTriage.triageSeverity === 'HIGH'
                ? 'high'
                : currentTriage.triageSeverity === 'MEDIUM'
                ? 'medium'
                : 'low'
            }
            dot
            size="md"
          >
            TRIAGE: {currentTriage.triageSeverity}
          </Badge>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-cardio-50 dark:bg-cardio-950/60 border border-cardio-200 dark:border-cardio-800 text-cardio-600 dark:text-cardio-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cardio-600 to-sky-600 text-white rounded-br-none shadow-sm'
                  : 'bg-slate-100/90 dark:bg-navy-900/90 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/80 rounded-bl-none'
              }`}
            >
              <p>{msg.content}</p>

              {/* Triage Alert Box if emergency */}
              {msg.triage && msg.triage.triageSeverity === 'EMERGENCY' && (
                <div className="p-3 bg-red-600 text-white rounded-xl border border-red-500 shadow-md space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>EMERGENCY PROTOCOL TRIGGERED</span>
                  </div>
                  <p className="text-[11px] opacity-95">{msg.triage.suggestedAction}</p>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-cardio-50 dark:bg-cardio-950/60 border border-cardio-200 dark:border-cardio-800 text-cardio-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-slate-100 dark:bg-navy-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cardio-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-cardio-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-cardio-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">AI analyzing cardiac symptoms...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-6 py-2 bg-slate-50/70 dark:bg-navy-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-semibold shrink-0">Quick report:</span>
        <button
          onClick={() => handleQuickPrompt('I have tightness in my chest and slight dizziness for 30 minutes.')}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap"
        >
          Chest tightness & dizziness
        </button>
        <button
          onClick={() => handleQuickPrompt('My heart has been fluttering rapidly while sitting.')}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap"
        >
          Palpitations / racing heart
        </button>
        <button
          onClick={() => handleQuickPrompt('Shortness of breath upon climbing stairs.')}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap"
        >
          Exertional breathlessness
        </button>
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white dark:bg-navy-850 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe how you are feeling (e.g., 'Sharp pain in left arm and chest')..."
          className="flex-1 bg-slate-100 dark:bg-navy-900 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-cardio-500"
        />
        <Button variant="danger" size="md" onClick={handleSend} disabled={!input.trim() || loading} icon={<Send className="w-4 h-4" />}>
          Report
        </Button>
      </div>
    </div>
  );
};

