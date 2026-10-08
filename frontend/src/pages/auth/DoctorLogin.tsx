import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { Stethoscope, Mail, Lock, ArrowRight } from 'lucide-react';

export const DoctorLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, 'doctor');
      addToast({
        type: 'success',
        title: 'Physician Portal Authenticated',
        message: 'Welcome to the CARDIA-X Clinical Triage Dashboard.',
      });
      navigate('/doctor/dashboard');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Authentication Denied',
        message: err.message || 'Invalid physician credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Stethoscope className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Physician Clinical Portal</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Secure sign in for registered Cardiologists & Electrophysiologists.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-navy-850 py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card space-y-6">
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}>
              <input type="text" name="username" autoComplete="username" tabIndex={-1} />
              <input type="password" name="password" autoComplete="current-password" tabIndex={-1} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Hospital Email / Medical ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="doctor-username"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  name="doctor-password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
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
              Access Clinical Workspace
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            Are you a practicing cardiologist?{' '}
            <Link to="/doctor/signup" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
              Register Physician Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

