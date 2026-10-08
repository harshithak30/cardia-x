import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { HeartPulse, ArrowRight, User, Mail, Lock, Phone, Calendar, Shield } from 'lucide-react';

export const PatientSignup: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const { signupPatient } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    dob: '1985-05-15',
    gender: 'male' as const,
    bloodGroup: 'O+',
    heightCm: 175,
    weightKg: 74,
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    hasHypertension: false,
    hasDiabetes: false,
    hasAsthma: false,
    heartDiseases: '',
    familyCardiacHistory: '',
    allergies: '',
    smokingStatus: 'never' as const,
    alcoholConsumption: 'none' as const,
    exerciseFrequency: 'moderate' as const,
    dailyStepGoal: 8000,
    sleepPatternHours: 7.5,
    dietPreference: 'balanced' as const,
    stressLevel: 'moderate' as const,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldName =
      name === 'patient-registration-identity'
        ? 'email'
        : name === 'patient-registration-secret'
          ? 'password'
          : name;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [fieldName]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep((prev) => (prev + 1) as any);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        heightCm: Number(formData.heightCm),
        weightKg: Number(formData.weightKg),
        emergencyContact: {
          name: formData.emergencyName || 'Emergency Contact',
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone || formData.phone,
        },
        medicalHistory: {
          heartDiseases: formData.heartDiseases ? formData.heartDiseases.split(',').map((s) => s.trim()) : [],
          hasHypertension: formData.hasHypertension,
          hasDiabetes: formData.hasDiabetes,
          hasAsthma: formData.hasAsthma,
          allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
          familyCardiacHistory: formData.familyCardiacHistory || 'None reported',
          previousSurgeries: [],
          smokingStatus: formData.smokingStatus,
          alcoholConsumption: formData.alcoholConsumption,
        },
        lifestyle: {
          exerciseFrequency: formData.exerciseFrequency,
          dailyStepGoal: Number(formData.dailyStepGoal),
          sleepPatternHours: Number(formData.sleepPatternHours),
          dietPreference: formData.dietPreference,
          stressLevel: formData.stressLevel,
        },
      };

      await signupPatient(payload);
      addToast({
        type: 'success',
        title: 'Account Created',
        message: 'Your CARDIA-X patient baseline profile has been initialized.',
      });
      navigate('/patient/dashboard');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Registration Error',
        message: err.message || 'Could not complete registration.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cardio-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-cardio-500/25">
            <HeartPulse className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Patient Onboarding</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Step {step} of 3 — Initialize your cardiovascular digital twin baseline.
        </p>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <span className={`w-12 h-1.5 rounded-full ${step >= 1 ? 'bg-cardio-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
          <span className={`w-12 h-1.5 rounded-full ${step >= 2 ? 'bg-cardio-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
          <span className={`w-12 h-1.5 rounded-full ${step >= 3 ? 'bg-cardio-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white dark:bg-navy-850 py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card">
          {/* STEP 1: Basic Demographics & Auth */}
          {step === 1 && (
            <form onSubmit={handleNext} autoComplete="off" className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                1. Account & Personal Demographics
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Johnathan Miller"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="patient-registration-identity"
                    required
                    autoComplete="off"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    name="patient-registration-secret"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    name="heightCm"
                    value={formData.heightCm}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    name="weightKg"
                    value={formData.weightKg}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-3">
                <Button type="submit" variant="primary" size="md" className="w-full" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  Proceed to Medical History
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Medical History */}
          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                2. Cardiovascular History & Conditions
              </h3>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Co-morbid Conditions</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <label className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasHypertension"
                      checked={formData.hasHypertension}
                      onChange={handleChange}
                      className="rounded text-cardio-600 focus:ring-cardio-500"
                    />
                    <span>Hypertension</span>
                  </label>

                  <label className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasDiabetes"
                      checked={formData.hasDiabetes}
                      onChange={handleChange}
                      className="rounded text-cardio-600 focus:ring-cardio-500"
                    />
                    <span>Diabetes</span>
                  </label>

                  <label className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasAsthma"
                      checked={formData.hasAsthma}
                      onChange={handleChange}
                      className="rounded text-cardio-600 focus:ring-cardio-500"
                    />
                    <span>Asthma</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Diagnosed Cardiac Diseases (comma separated)
                </label>
                <input
                  type="text"
                  name="heartDiseases"
                  value={formData.heartDiseases}
                  onChange={handleChange}
                  placeholder="e.g. Coronary Artery Disease, Atrial Fibrillation, Arrhythmia"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Known Drug Allergies
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="e.g. Penicillin, Aspirin, Sulfa"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Smoking Status</label>
                  <select
                    name="smokingStatus"
                    value={formData.smokingStatus}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="never">Never Smoked</option>
                    <option value="former">Former Smoker</option>
                    <option value="current">Current Smoker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alcohol Consumption</label>
                  <select
                    name="alcoholConsumption"
                    value={formData.alcoholConsumption}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="none">None</option>
                    <option value="occasional">Occasional</option>
                    <option value="moderate">Moderate</option>
                    <option value="heavy">Frequent</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="secondary" size="md" onClick={() => setStep(1)} className="w-1/3">
                  Back
                </Button>
                <Button type="submit" variant="primary" size="md" className="w-2/3" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  Proceed to Lifestyle
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Lifestyle & Emergency Contact */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                3. Lifestyle & Emergency Coordination
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Exercise Habit</label>
                  <select
                    name="exerciseFrequency"
                    value={formData.exerciseFrequency}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="sedentary">Sedentary (No exercise)</option>
                    <option value="light">Light (1-2 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="active">Active (Daily high intensity)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Diet Preference</label>
                  <select
                    name="dietPreference"
                    value={formData.dietPreference}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="balanced">Balanced</option>
                    <option value="low-sodium">Low-Sodium (Cardiac)</option>
                    <option value="mediterranean">Mediterranean</option>
                    <option value="vegetarian">Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Daily Steps Target</label>
                  <input
                    type="number"
                    name="dailyStepGoal"
                    value={formData.dailyStepGoal}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sleep Hours / Night</label>
                  <input
                    type="number"
                    step="0.5"
                    name="sleepPatternHours"
                    value={formData.sleepPatternHours}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Emergency Contact Information</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="emergencyName"
                    placeholder="Contact Full Name"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-rose-200 dark:border-rose-800 rounded-xl text-xs"
                  />
                  <input
                    type="tel"
                    name="emergencyPhone"
                    placeholder="Emergency Phone #"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-rose-200 dark:border-rose-800 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="secondary" size="md" onClick={() => setStep(2)} className="w-1/3">
                  Back
                </Button>
                <Button
                  type="button"
                  variant="vital"
                  size="md"
                  loading={loading}
                  onClick={handleSubmit}
                  className="w-2/3"
                >
                  Complete Registration
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-6">
            Already have an account?{' '}
            <Link to="/patient/login" className="font-bold text-cardio-600 dark:text-cardio-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

