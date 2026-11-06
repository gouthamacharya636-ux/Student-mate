/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { SubjectsView } from './components/SubjectsView';
import { AssignmentsView } from './components/AssignmentsView';
import { ExamsView } from './components/ExamsView';
import { AIPlannerView } from './components/AIPlannerView';
import { AIAssistantView } from './components/AIAssistantView';
import { PomodoroView } from './components/PomodoroView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';

const AppContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Authentication Modal if not signed in */}
      <AuthModal isOpen={!isAuthenticated} />

      {/* Modern SaaS Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header Bar */}
        <Header />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'subjects' && <SubjectsView />}
          {activeTab === 'assignments' && <AssignmentsView />}
          {activeTab === 'exams' && <ExamsView />}
          {activeTab === 'planner' && <AIPlannerView />}
          {activeTab === 'assistant' && <AIAssistantView />}
          {activeTab === 'pomodoro' && <PomodoroView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
