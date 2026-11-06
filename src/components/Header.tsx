import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Sparkles,
  Timer,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Trash2,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsMobileMenuOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    user,
    aiStatus
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Academic Dashboard', subtitle: 'Real-time overview of your coursework & exams' };
      case 'subjects':
        return { title: 'My Subjects', subtitle: 'Syllabus tracking, credit hours & curriculum difficulty' };
      case 'assignments':
        return { title: 'Assignment Manager', subtitle: 'Track problem sets, lab reports & project deadlines' };
      case 'exams':
        return { title: 'Examination Schedule', subtitle: 'Live countdowns, revision statuses & high-yield topics' };
      case 'planner':
        return { title: 'AI Study Planner', subtitle: 'Intelligent conflict-free timetable generator' };
      case 'assistant':
        return { title: 'StudyMate AI Assistant', subtitle: 'Personalized engineering mentor & exam tutor' };
      case 'pomodoro':
        return { title: 'Focus Timer', subtitle: 'High-intensity Pomodoro sprints with ambient acoustics' };
      case 'analytics':
        return { title: 'Progress Analytics', subtitle: 'Weekly study velocity, subject distribution & streaks' };
      case 'settings':
        return { title: 'Settings & Profile', subtitle: 'Manage academic goals, semesters & backup data' };
      default:
        return { title: 'StudyMate AI', subtitle: 'Engineering Student Suite' };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-8 backdrop-blur-md">
      {/* Left: Mobile trigger & Page info */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
              Fall 2026
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Right: Quick actions & Notifications & AI status */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* AI Engine Status Pill */}
        <div
          onClick={() => setActiveTab('assistant')}
          className="cursor-pointer hidden sm:flex items-center gap-2 rounded-full border border-purple-200/80 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 px-3 py-1 text-xs font-semibold text-purple-800 hover:shadow-xs transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          <span>{aiStatus.hasApiKey ? 'Gemini 2.5 Flash' : 'StudyMate AI Active'}</span>
        </div>

        {/* Quick Focus Button */}
        {activeTab !== 'pomodoro' && (
          <button
            onClick={() => setActiveTab('pomodoro')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-500/20 hover:from-purple-700 hover:to-indigo-700 transition-all active:scale-95"
          >
            <Timer className="h-4 w-4" />
            <span className="hidden xs:inline">Quick Focus</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-xl border border-slate-200/90 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      title="Clear notifications"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto py-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">You are all caught up!</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.linkTab) {
                          setActiveTab(n.linkTab as any);
                          setShowNotifications(false);
                        }
                      }}
                      className={`group p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        n.read
                          ? 'bg-white border-slate-100 hover:bg-slate-50'
                          : 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              n.type === 'exam'
                                ? 'bg-purple-100 text-purple-600'
                                : n.type === 'assignment'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {n.type === 'exam' ? (
                              <Calendar className="h-4 w-4" />
                            ) : n.type === 'assignment' ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{n.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                          </div>
                        </div>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1"></span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Trigger */}
        <div
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};
