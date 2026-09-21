import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HeartPulse,
  Sun,
  Moon,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  Stethoscope,
  ChevronDown,
  Activity,
  Menu,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { notificationApi } from '../../api';
import { Notification } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, role, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let active = true;

    if (!isAuthenticated) {
      setNotifications([]);
      return () => {
        active = false;
      };
    }

    notificationApi
      .getAll()
      .then((response) => {
        if (active && response.success) {
          setNotifications(response.notifications);
        }
      })
      .catch(() => {
        if (active) setNotifications([]);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, role]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await notificationApi.markRead(notification._id);
      setNotifications((current) =>
        current.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item))
      );
    }
    setNotifDropdown(false);
    if (notification.actionUrl) navigate(notification.actionUrl);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cardio-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-cardio-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  CARDIA-X
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-cardio-50 dark:bg-cardio-950/60 text-cardio-600 dark:text-cardio-400 border border-cardio-200 dark:border-cardio-800 rounded-md">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 -mt-0.5 tracking-wide hidden sm:inline">
                Longitudinal AI Cardiology
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Portal Navigation Pills */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-navy-850 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs font-semibold">
          <Link
            to="/patient/dashboard"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              role === 'patient'
                ? 'bg-white dark:bg-navy-800 text-cardio-600 dark:text-cardio-400 shadow-subtle'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Patient Portal
          </Link>
          <Link
            to="/doctor/dashboard"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              role === 'doctor'
                ? 'bg-white dark:bg-navy-800 text-cardio-600 dark:text-cardio-400 shadow-subtle'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Doctor Portal
          </Link>
          <Link
            to="/admin/dashboard"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              role === 'admin'
                ? 'bg-white dark:bg-navy-800 text-cardio-600 dark:text-cardio-400 shadow-subtle'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </Link>
        </div>

        {/* Right: Actions, Theme, Notifications & User */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700 flex items-center justify-center transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {isAuthenticated && (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdown(!notifDropdown)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700 flex items-center justify-center transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 px-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Notifications</span>
                      <Badge variant={unreadCount ? 'info' : 'neutral'} size="sm">
                        {unreadCount ? `${unreadCount} New` : 'Up to date'}
                      </Badge>
                    </div>
                    <div className="py-2 space-y-2 text-xs max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-2 py-5 text-center text-slate-500 dark:text-slate-400">No notifications yet.</p>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification._id}
                            type="button"
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full text-left p-2 rounded-xl border transition-colors ${
                              notification.isRead
                                ? 'bg-slate-50 dark:bg-navy-900 border-slate-100 dark:border-slate-800'
                                : 'bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-800'
                            }`}
                          >
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{notification.title}</p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{notification.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors text-xs font-semibold"
                >
                  <div className="w-6 h-6 rounded-lg bg-cardio-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline text-slate-700 dark:text-slate-200">{user?.fullName?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 text-xs">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-1.5">
                        <Badge variant={role === 'doctor' ? 'success' : role === 'admin' ? 'high' : 'info'} size="sm">
                          {role?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="py-1">
                      {role === 'patient' && (
                        <button
                          onClick={() => {
                            setProfileDropdown(false);
                            navigate('/patient/profile');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <UserIcon className="w-4 h-4" />
                          Health Profile
                        </button>
                      )}
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link
                to="/patient/login"
                className="px-3 py-1.5 text-xs font-semibold text-cardio-600 dark:text-cardio-400 hover:bg-cardio-50 dark:hover:bg-cardio-950/40 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/patient/signup"
                className="px-3.5 py-1.5 text-xs font-semibold bg-cardio-600 hover:bg-cardio-700 text-white rounded-xl shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

