import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ClinicalGuideline } from '../../types';
import { BookOpen, Plus, Sparkles, CheckCircle2 } from 'lucide-react';

export const GuidelinesManagerPage: React.FC = () => {
  const [guidelines, setGuidelines] = useState<ClinicalGuideline[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useNotification();

  const [form, setForm] = useState({
    title: '',
    organization: 'ACC/AHA',
    topic: '',
    keywords: '',
    recommendationText: '',
    levelOfEvidence: 'Class I (Level A)',
    actionableSummary: '',
  });

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getGuidelines();
      if (res.success) {
        setGuidelines(res.guidelines);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminApi.addGuideline(form);
      if (res.success) {
        addToast({ type: 'success', title: 'Guideline Document Added to RAG Vector Store' });
        setIsModalOpen(false);
        setForm({
          title: '',
          organization: 'ACC/AHA',
          topic: '',
          keywords: '',
          recommendationText: '',
          levelOfEvidence: 'Class I (Level A)',
          actionableSummary: '',
        });
        fetchGuidelines();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to add', message: err.message });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cardiovascular Clinical Guidelines (RAG)</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            AHA, ACC, and ESC evidence knowledge base queried by the Evidence Retrieval Agent.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Guideline Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {guidelines.map((g) => (
          <Card key={g.id} className="p-5 space-y-3 text-xs">
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{g.title}</span>
              <Badge variant={g.sourceType === 'reference_dataset' ? 'medium' : 'info'} size="sm">
                {g.sourceType === 'reference_dataset' ? 'Reference data' : g.sourceType === 'source_document' ? 'Source extract' : g.organization}
              </Badge>
            </div>

            <p className="text-[11px] text-slate-500 font-semibold uppercase">{g.topic}</p>

            <p className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 italic leading-relaxed">
              "{g.recommendationText}"
            </p>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{g.sourceType === 'guideline' || !g.sourceType ? g.levelOfEvidence : 'Not guideline-graded'}</span>
              <span className="text-slate-400">Keywords: {g.keywords?.slice(0, 3).join(', ')}</span>
            </div>
            {g.source && <p className="text-[10px] text-slate-400">Source: {g.source}</p>}
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Clinical Guideline Document"
        subtitle="Ingest into RAG semantic index"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Guideline Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. 2024 ESC Hypertension Guidelines"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Organization</label>
              <select
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              >
                <option value="ACC/AHA">ACC/AHA</option>
                <option value="ESC">ESC</option>
                <option value="HFSA">HFSA</option>
                <option value="ADA">ADA</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Evidence Grade</label>
              <input
                type="text"
                value={form.levelOfEvidence}
                onChange={(e) => setForm({ ...form, levelOfEvidence: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Recommendation Text</label>
            <textarea
              rows={3}
              required
              value={form.recommendationText}
              onChange={(e) => setForm({ ...form, recommendationText: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Keywords (comma separated)</label>
            <input
              type="text"
              required
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="e.g. troponin, chest pain, ecg, statin"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Guideline
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

