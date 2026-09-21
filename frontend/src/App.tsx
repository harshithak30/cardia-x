import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { PatientLogin } from './pages/auth/PatientLogin';
import { PatientSignup } from './pages/auth/PatientSignup';
import { DoctorLogin } from './pages/auth/DoctorLogin';
import { DoctorSignup } from './pages/auth/DoctorSignup';
import { AdminLogin } from './pages/auth/AdminLogin';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientProfilePage } from './pages/patient/PatientProfilePage';
import { MedicalReportsPage } from './pages/patient/MedicalReportsPage';
import { ECGAnalysisPage } from './pages/patient/ECGAnalysisPage';
import { MedicationManagerPage } from './pages/patient/MedicationManagerPage';
import { WearablesMonitorPage } from './pages/patient/WearablesMonitorPage';
import { TimelinePage } from './pages/patient/TimelinePage';
import { AICareAssistantPage } from './pages/patient/AICareAssistantPage';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorPatientsPage } from './pages/doctor/DoctorPatientsPage';
import { DoctorPatientDetailPage } from './pages/doctor/DoctorPatientDetailPage';
import { DoctorApprovalsPage } from './pages/doctor/DoctorApprovalsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DoctorVerificationPage } from './pages/admin/DoctorVerificationPage';
import { AIAgentMonitorPage } from './pages/admin/AIAgentMonitorPage';
import { GuidelinesManagerPage } from './pages/admin/GuidelinesManagerPage';

// Protected App Layout with Navbar and responsive Sidebar
const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <div className="w-8 h-8 rounded-full border-2 border-cardio-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-cardio-500 selection:text-white">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {isAuthenticated && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Route Guard
const ProtectedRoute: React.FC<{ allowedRoles: string[] }> = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    if (allowedRoles.includes('doctor')) return <Navigate to="/doctor/login" replace />;
    if (allowedRoles.includes('admin')) return <Navigate to="/admin/login" replace />;
    return <Navigate to="/patient/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }

  return <Outlet />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Public Auth Portals */}
              <Route path="/patient/login" element={<PatientLogin />} />
              <Route path="/patient/signup" element={<PatientSignup />} />
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/doctor/signup" element={<DoctorSignup />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Authenticated Layout */}
              <Route element={<AppLayout />}>
                {/* Patient Portal Routes */}
                <Route element={<ProtectedRoute allowedRoles={['patient', 'admin']} />}>
                  <Route path="/patient/dashboard" element={<PatientDashboard />} />
                  <Route path="/patient/profile" element={<PatientProfilePage />} />
                  <Route path="/patient/reports" element={<MedicalReportsPage />} />
                  <Route path="/patient/ecgs" element={<ECGAnalysisPage />} />
                  <Route path="/patient/medications" element={<MedicationManagerPage />} />
                  <Route path="/patient/wearables" element={<WearablesMonitorPage />} />
                  <Route path="/patient/timeline" element={<TimelinePage />} />
                  <Route path="/patient/assistant" element={<AICareAssistantPage />} />
                </Route>

                {/* Doctor Portal Routes */}
                <Route element={<ProtectedRoute allowedRoles={['doctor', 'admin']} />}>
                  <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                  <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
                  <Route path="/doctor/patients/:patientId" element={<DoctorPatientDetailPage />} />
                  <Route path="/doctor/approvals" element={<DoctorApprovalsPage />} />
                  <Route path="/doctor/guidelines" element={<GuidelinesManagerPage />} />
                </Route>

                {/* Admin Portal Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/verifications" element={<DoctorVerificationPage />} />
                  <Route path="/admin/agents" element={<AIAgentMonitorPage />} />
                  <Route path="/admin/guidelines" element={<GuidelinesManagerPage />} />
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;

