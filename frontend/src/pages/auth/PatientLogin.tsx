import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { HeartPulse, Mail, Lock, ArrowRight, User } from 'lucide-react';

export const PatientLogin: React.FC = () => {
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
      await login(email, password, 'patient');
      addToast({
        type: 'success',
        title: 'Welcome to CARDIA-X',
        message: 'Successfully logged into your patient dashboard.',
      });
      navigate('/patient/dashboard');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Sign In Failed',
        message: err.message || 'Invalid email or password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cardio-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-cardio-500/25">
            <HeartPulse className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Patient Portal Sign In</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Access your longitudinal cardiovascular records, ECGs, and AI care assistant.
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
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="patient-sign-in-identity"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cardio-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  name="patient-sign-in-secret"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cardio-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Sign In to Patient Portal
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            Don't have an account?{' '}
            <Link to="/patient/signup" className="font-bold text-cardio-600 dark:text-cardio-400 hover:underline">
              Create Patient Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

