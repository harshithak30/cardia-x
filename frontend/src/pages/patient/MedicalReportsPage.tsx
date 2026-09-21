import React, { useEffect, useState } from 'react';
import { patientApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { DocumentUploader } from '../../components/documents/DocumentUploader';
import { OCRConfirmationModal } from '../../components/documents/OCRConfirmationModal';
import { MedicalReport } from '../../types';
import {
  FileText,
  Upload,
  Activity,
  Calendar,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
} from 'lucide-react';

export const MedicalReportsPage: React.FC = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [extractedReport, setExtractedReport] = useState<MedicalReport | null>(null);
  const [isOcrConfirmOpen, setIsOcrConfirmOpen] = useState(false);
  const { addToast } = useNotification();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await patientApi.getReports();
      if (res.success) {
        setReports(res.reports);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUploadComplete = (uploadRes: any) => {
    setIsUploadModalOpen(false);
    setExtractedReport(uploadRes.report);
    setIsOcrConfirmOpen(true);
    fetchReports();
  };

  const types = ['ALL', 'ECG', 'Lipid Profile', 'Blood Test', 'Echocardiography', 'Prescription'];
  const filteredReports = filterType === 'ALL' ? reports : reports.filter((r) => r.reportType === filterType);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Medical Reports & Document Vault</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ingest lab panels, 12-lead ECGs, and echocardiography scans for automated AI OCR entity extraction.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsUploadModalOpen(true)}
          icon={<Upload className="w-4 h-4" />}
        >
          Upload New Report
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === type
                ? 'bg-cardio-600 text-white shadow-sm'
                : 'bg-white dark:bg-navy-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {type === 'ALL' ? 'All Document Types' : type}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report) => (
          <Card
            key={report._id}
            hover
            onClick={() => {
              setSelectedReport(report);
              setIsDetailModalOpen(true);
            }}
            className="p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-cardio-50 dark:bg-cardio-950/60 text-cardio-600 dark:text-cardio-400 border border-cardio-100 dark:border-cardio-800 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <Badge
                  variant={
                    report.reportType === 'ECG'
                      ? 'success'
                      : report.reportType === 'Lipid Profile'
                      ? 'info'
                      : report.reportType === 'Prescription'
                      ? 'low'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {report.reportType}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{report.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {report.hospitalName || 'Diagnostic Center'}
                </p>
              </div>

              {report.extractedData?.aiSummary && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-navy-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {report.extractedData.aiSummary}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(report.reportDate).toLocaleDateString()}
              </span>
              <span className="text-cardio-600 dark:text-cardio-400 font-semibold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> View OCR Data
              </span>
            </div>
          </Card>
        ))}

        {filteredReports.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            No medical reports found. Click "Upload New Report" to analyze an ECG or laboratory document.
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Medical Report"
        subtitle="Ingest PDF / image reports for automated entity extraction"
        maxWidth="lg"
      >
        <DocumentUploader onUploadSuccess={handleUploadComplete} />
      </Modal>

      {/* Confirmation Modal */}
      <OCRConfirmationModal
        isOpen={isOcrConfirmOpen}
        onClose={() => setIsOcrConfirmOpen(false)}
        report={extractedReport}
        onConfirm={() => {
          addToast({
            type: 'success',
            title: 'Report Verified',
            message: 'Extracted clinical data was confirmed.',
          });
        }}
      />

      {/* Report Detail Modal */}
      {selectedReport && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedReport.title}
          subtitle={`Report Type: ${selectedReport.reportType} • Date: ${new Date(
            selectedReport.reportDate
          ).toLocaleDateString()}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {selectedReport.extractedData?.aiSummary && (
              <div className="p-3.5 rounded-2xl bg-cardio-50/70 dark:bg-cardio-950/40 border border-cardio-200 dark:border-cardio-900">
                <h5 className="font-bold text-cardio-900 dark:text-cardio-200 mb-1">AI Clinical Summary</h5>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedReport.extractedData.aiSummary}
                </p>
              </div>
            )}

            {selectedReport.extractedData?.labValues && selectedReport.extractedData.labValues.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 text-[11px]">
                  Extracted Biomarker Measurements
                </h5>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-navy-900 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-2.5">Parameter</th>
                        <th className="p-2.5">Value</th>
                        <th className="p-2.5">Reference Range</th>
                        <th className="p-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedReport.extractedData.labValues.map((val, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium">{val.parameter}</td>
                          <td className="p-2.5 font-bold">
                            {val.value} {val.unit}
                          </td>
                          <td className="p-2.5 text-slate-500">{val.referenceRange}</td>
                          <td className="p-2.5 text-right">
                            <Badge variant={val.isAbnormal ? 'high' : 'low'} size="sm">
                              {val.isAbnormal ? 'ABNORMAL' : 'NORMAL'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedReport.extractedData?.medications && selectedReport.extractedData.medications.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 text-[11px]">
                  Extracted Medications
                </h5>
                <div className="space-y-1.5">
                  {selectedReport.extractedData.medications.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-bold">{m.name}</span>
                      <span className="text-slate-500">{m.dosage} • {m.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

