import React, { useEffect, useState } from 'react';
import { patientApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { User, Heart, Shield, Save, Edit3, Activity, AlertCircle } from 'lucide-react';
import { PatientProfile } from '../../types';

export const PatientProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useNotification();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await patientApi.getProfile();
      if (res.success) {
        setProfile(res.profile);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await patientApi.updateProfile(profile);
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Permanent cardiovascular medical profile saved successfully.',
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-navy-800 rounded-2xl" />
        <div className="h-96 bg-slate-200 dark:bg-navy-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Permanent Health Profile</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Baseline clinical parameters, cardiac history, and lifestyle goals.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          loading={saving}
          onClick={handleSave}
          icon={<Save className="w-4 h-4" />}
        >
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Demographics */}
        <Card>
          <CardHeader
            title="1. Personal & Physical Attributes"
            subtitle="Height, weight, and blood group used for hemodynamic calculations"
            icon={<User className="w-5 h-5 text-cardio-600" />}
          />
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  value={profile.age || 50}
                  onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e: any) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={profile.heightCm}
                  onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={profile.weightKg}
                  onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                <input
                  type="text"
                  value={profile.bloodGroup}
                  onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Calculated BMI</label>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-900 font-bold text-slate-800 dark:text-slate-200">
                  {profile.bmi || ((profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1))} kg/m²
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cardiovascular Medical History */}
        <Card>
          <CardHeader
            title="2. Cardiovascular & Co-morbid History"
            subtitle="Underlying conditions and active diagnoses"
            icon={<Heart className="w-5 h-5 text-pulse-500" />}
          />
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <label className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={profile.medicalHistory?.hasHypertension}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      medicalHistory: { ...profile.medicalHistory, hasHypertension: e.target.checked },
                    })
                  }
                  className="rounded text-cardio-600 focus:ring-cardio-500"
                />
                Hypertension
              </label>

              <label className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={profile.medicalHistory?.hasDiabetes}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      medicalHistory: { ...profile.medicalHistory, hasDiabetes: e.target.checked },
                    })
                  }
                  className="rounded text-cardio-600 focus:ring-cardio-500"
                />
                Diabetes Mellitus
              </label>

              <label className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={profile.medicalHistory?.hasAsthma}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      medicalHistory: { ...profile.medicalHistory, hasAsthma: e.target.checked },
                    })
                  }
                  className="rounded text-cardio-600 focus:ring-cardio-500"
                />
                Asthma / COPD
              </label>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Diagnosed Heart Diseases (comma separated)
              </label>
              <input
                type="text"
                value={profile.medicalHistory?.heartDiseases?.join(', ') || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    medicalHistory: {
                      ...profile.medicalHistory,
                      heartDiseases: e.target.value.split(',').map((s) => s.trim()),
                    },
                  })
                }
                placeholder="e.g. Coronary Artery Disease, Mitral Valve Prolapse, Paroxysmal Afib"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Drug Allergies</label>
                <input
                  type="text"
                  value={profile.medicalHistory?.allergies?.join(', ') || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      medicalHistory: {
                        ...profile.medicalHistory,
                        allergies: e.target.value.split(',').map((s) => s.trim()),
                      },
                    })
                  }
                  placeholder="e.g. Penicillin, Sulfa"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Family Cardiac History</label>
                <input
                  type="text"
                  value={profile.medicalHistory?.familyCardiacHistory || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      medicalHistory: { ...profile.medicalHistory, familyCardiacHistory: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

