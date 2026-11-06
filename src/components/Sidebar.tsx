import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  GraduationCap,
  Sparkles,
  Bot,
  Timer,
  BarChart3,
  Settings,
  X,
  LogOut,
  Flame,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    assignments,
    exams,
    user,
    logout
  } = useApp();

  const pendingAssignmentsCount = assignments.filter((a) => a.status !== 'Completed').length;
  const upcomingExamsCount = exams.filter((e) => e.revisionStatus !== 'Completed').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: CheckSquare,
      badge: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: GraduationCap,
      badge: upcomingExamsCount > 0 ? upcomingExamsCount : undefined,
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'planner',
      label: 'AI Study Planner',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      icon: Bot,
      badge: 'Online',
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    { id: 'pomodoro', label: 'Focus Timer', icon: Timer },
    { id: 'analytics', label: 'Progress Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-slate-200/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                StudyMate<span className="text-indigo-600">.ai</span>
              </span>
              <p className="text-[11px] font-medium text-slate-400">Engineering Student Suite</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Study Streak Card */}
        <div className="px-5 pt-4 pb-2">
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50/60 to-blue-50 border border-indigo-100/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white shadow-xs text-amber-500">
                <Flame className="h-5 w-5 fill-amber-500 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">5 Days Study Streak!</p>
                <p className="text-[11px] text-slate-500">Target: 4.5h daily</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 rounded-full bg-indigo-100/60">
              Level 4
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <p className="px-3 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-xs">
            <div
              className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1 mr-2"
              onClick={() => setActiveTab('settings')}
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Alex Rivera'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.major || 'CSE Major'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
