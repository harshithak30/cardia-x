import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { Stethoscope, ArrowRight, Mail, Lock, Building, Award, Shield } from 'lucide-react';

export const DoctorSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    medicalRegNumber: '',
    hospitalName: '',
    specialization: 'Cardiologist',
    yearsOfExperience: 8,
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const { signupDoctor } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signupDoctor(formData);
      addToast({
        type: 'success',
        title: 'Physician Account Registered',
        message: 'Welcome to CARDIA-X Clinical Intelligence Portal.',
      });
      navigate('/doctor/dashboard');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Registration Error',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Stethoscope className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Physician Registration</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Join the hospital network to review AI recommendations and manage patient timelines.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white dark:bg-navy-850 py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card">
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name (with Title)</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Dr. Katherine Wells, MD, FACC"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Institutional Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="section-doctor-registration username"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="dr.wells@heartcenter.org"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  autoComplete="section-doctor-registration new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Medical License / Reg Number</label>
                <input
                  type="text"
                  name="medicalRegNumber"
                  required
                  value={formData.medicalRegNumber}
                  onChange={handleChange}
                  placeholder="e.g. MD-NY-98124"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Hospital / Clinic</label>
                <input
                  type="text"
                  name="hospitalName"
                  required
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="e.g. Mount Sinai Heart"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cardiology Subspecialty</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="Interventional Cardiology">Interventional Cardiology</option>
                  <option value="Cardiac Electrophysiology">Cardiac Electrophysiology</option>
                  <option value="Heart Failure & Transplant">Heart Failure & Transplant</option>
                  <option value="Preventative Cardiology">Preventative Cardiology</option>
                  <option value="General Clinical Cardiology">General Clinical Cardiology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Biography (Optional)</label>
              <textarea
                rows={2}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Brief summary of clinical focus, procedural expertise, and research..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <Button
              type="submit"
              variant="vital"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Register & Request License Verification
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-6">
            Already verified?{' '}
            <Link to="/doctor/login" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

