import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Stethoscope, CheckCircle2, XCircle, UserPlus } from 'lucide-react';

export const DoctorVerificationPage: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const [doctorRes, patientRes] = await Promise.all([adminApi.getDoctors(), adminApi.getPatients()]);
      if (doctorRes.success) setDoctors(doctorRes.doctors);
      if (patientRes.success) setPatients(patientRes.patients);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (doctorProfileId: string) => {
    const patientId = selectedPatient[doctorProfileId];
    if (!patientId) return;
    try {
      await adminApi.assignPatient(doctorProfileId, patientId);
      addToast({ type: 'success', title: 'Patient assigned', message: 'The doctor can now access this patient dossier.' });
      setSelectedPatient((current) => ({ ...current, [doctorProfileId]: '' }));
      fetchDoctors();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Assignment failed', message: err.message });
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleVerify = async (doctorProfileId: string, status: 'approved' | 'rejected') => {
    try {
      await adminApi.verifyDoctor(doctorProfileId, status);
      addToast({
        type: 'success',
        title: `Doctor Status Updated to ${status.toUpperCase()}`,
      });
      fetchDoctors();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Physician Licensing & Credentials Verification</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Verify medical licenses and authorize cardiologist credentials on the CARDIA-X Care Network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => {
          const u = doc.userId || {};
          return (
            <Card key={doc._id} className="p-5 space-y-4 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-extrabold flex items-center justify-center text-sm border border-teal-200 dark:border-teal-800">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{u.fullName}</h4>
                    <p className="text-[11px] text-slate-400">{doc.specialization}</p>
                  </div>
                </div>

                <Badge variant={doc.verificationStatus === 'approved' ? 'success' : 'medium'} size="sm">
                  {doc.verificationStatus?.toUpperCase()}
                </Badge>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl space-y-1 text-[11px] border border-slate-100 dark:border-slate-800">
                <p>
                  <strong>License No:</strong> <span className="font-mono text-cardio-600 dark:text-cardio-400">{doc.medicalRegNumber}</span>
                </p>
                <p>
                  <strong>Hospital:</strong> {doc.hospitalName}
                </p>
                <p>
                  <strong>Experience:</strong> {doc.yearsOfExperience} years
                </p>
                <p>
                  <strong>Assigned patients:</strong> {doc.assignedPatients?.length || 0}
                </p>
              </div>

              {doc.verificationStatus === 'approved' && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedPatient[doc._id] || ''}
                    onChange={(event) => setSelectedPatient((current) => ({ ...current, [doc._id]: event.target.value }))}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-navy-900"
                  >
                    <option value="">Assign a patient...</option>
                    {patients.map((patient) => {
                      const patientUser = typeof patient.userId === 'object' ? patient.userId : null;
                      return (
                        <option key={patient.userId as string} value={patientUser?._id || patient.userId}>
                          {patientUser?.fullName || 'Patient'}
                        </option>
                      );
                    })}
                  </select>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!selectedPatient[doc._id]}
                    onClick={() => handleAssign(doc._id)}
                    icon={<UserPlus className="w-3.5 h-3.5" />}
                  >
                    Assign
                  </Button>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                {doc.verificationStatus !== 'approved' && (
                  <Button
                    variant="vital"
                    size="sm"
                    onClick={() => handleVerify(doc._id, 'approved')}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Approve
                  </Button>
                )}
                {doc.verificationStatus !== 'rejected' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleVerify(doc._id, 'rejected')}
                    icon={<XCircle className="w-3.5 h-3.5" />}
                  >
                    Reject
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

