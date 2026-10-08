import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { aiApi } from '../../api';
import {
  Send,
  Sparkles,
  User,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  guidelines?: Array<{
    title: string;
    organization: string;
    recommendationText: string;
    levelOfEvidence: string;
    sourceType?: string;
    relevanceScore: number;
  }>;
  confidenceScore?: number;
}

export const EvidenceRAGAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Ask about cardiovascular care or medication information. Retrieved sources are labelled as guidelines, extracted documents, or reference datasets; confirm personal care decisions with your physician.',
      guidelines: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedGuidelineIdx, setExpandedGuidelineIdx] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const query = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setLoading(true);

    try {
      const res = await aiApi.evidenceChat({ query });
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.answer,
            guidelines: res.retrievedGuidelines,
            confidenceScore: res.confidenceScore,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not connect to the clinical knowledge retrieval engine. Please try again or consult your physician.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleGuideline = (key: string) => {
    setExpandedGuidelineIdx((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex flex-col h-[640px] bg-white dark:bg-navy-850 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-4 px-6 bg-slate-50 dark:bg-navy-900 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cardio-600 to-sky-500 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cardiovascular AI Health Assistant</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Retrieval-Augmented Clinical Intelligence (RAG)</p>
          </div>
        </div>

        <Badge variant="info" dot size="md">
          Evidence Sources
        </Badge>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-lg p-4 rounded-2xl text-xs leading-relaxed space-y-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cardio-600 to-sky-600 text-white rounded-br-none shadow-sm'
                  : 'bg-slate-100/90 dark:bg-navy-900/90 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/80 rounded-bl-none'
              }`}
            >
              <div className="prose dark:prose-invert prose-xs max-w-none whitespace-pre-wrap">{msg.content}</div>

              {/* RAG Guideline Evidence Cards */}
              {msg.guidelines && msg.guidelines.length > 0 && (
                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                      <BookOpen className="w-3.5 h-3.5" />
                      Retrieved Clinical Evidence ({msg.guidelines.length} sources)
                    </span>
                    <span>Confidence: {((msg.confidenceScore || 0.95) * 100).toFixed(0)}%</span>
                  </div>

                  {msg.guidelines.map((g, gIdx) => {
                    const cardKey = `${index}-${gIdx}`;
                    const isExpanded = expandedGuidelineIdx === cardKey;
                    return (
                      <div
                        key={gIdx}
                        className="p-2.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1.5"
                      >
                        <div
                          onClick={() => toggleGuideline(cardKey)}
                          className="flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200 font-semibold"
                        >
                          <span className="truncate max-w-[280px]">
                            [{g.organization}] {g.title}
                          </span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                        </div>

                        {isExpanded && (
                          <div className="pt-1 text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 space-y-1">
                            <p className="italic bg-slate-50 dark:bg-navy-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                              "{g.recommendationText}"
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                              <span>{g.sourceType === 'reference_dataset' ? 'Source type: ' : 'Evidence level: '}<strong className="text-emerald-500">{g.levelOfEvidence}</strong></span>
                              <span>Relevance: {(g.relevanceScore * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-slate-100 dark:bg-navy-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">Retrieving AHA/ESC clinical guidelines...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white dark:bg-navy-850 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question (e.g. 'What is the target LDL level for high-risk CAD patients?')..."
          className="flex-1 bg-slate-100 dark:bg-navy-900 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-cardio-500"
        />
        <Button variant="primary" size="md" onClick={handleSend} disabled={!input.trim() || loading} icon={<Send className="w-4 h-4" />}>
          Ask AI
        </Button>
      </div>
    </div>
  );
};

