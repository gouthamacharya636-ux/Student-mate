import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  BookOpen,
  Mail,
  Lock,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Shield,
  Save,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/audio';

export const SettingsView: React.FC = () => {
  const {
    user,
    updateProfile,
    resetToSampleData,
    resetPassword,
    logout,
    aiStatus,
    subjects,
    assignments,
    exams
  } = useApp();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [college, setCollege] = useState(user?.college || '');
  const [major, setMajor] = useState(user?.major || '');
  const [semester, setSemester] = useState(user?.semester || '5th Semester');
  const [dailyGoal, setDailyGoal] = useState(user?.dailyStudyGoal || 4.5);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password reset fields
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      college: college.trim(),
      major: major.trim(),
      semester,
      dailyStudyGoal: Number(dailyGoal)
    });
    setSaveSuccess(true);
    soundManager.playSuccess();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return;
    await resetPassword(email, newPassword);
    setPasswordSuccess(true);
    setNewPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    soundManager.setSoundEnabled(enabled);
    if (enabled) soundManager.playChime();
  };

  const handleBackupExport = () => {
    const backupData = {
      profile: user,
      subjects,
      assignments,
      exams,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyMate_Backup_${user?.name?.replace(/\s+/g, '_') || 'Student'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Academic Settings & Profile</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your engineering identity, target study hours, credentials, and app preferences.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Student Profile</h3>
            <p className="text-xs text-slate-500">Your details calibrate AI recommendations and schedule generation.</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester / Term</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="3rd Semester">3rd Semester</option>
                <option value="4th Semester">4th Semester</option>
                <option value="5th Semester">5th Semester</option>
                <option value="6th Semester">6th Semester</option>
                <option value="7th Semester">7th Semester</option>
                <option value="8th Semester">8th Semester</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Branch / Major</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Daily Study Goal (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="12"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {saveSuccess ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Profile updated successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-400">All changes persist to your personal account.</span>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-purple-700 hover:to-indigo-700 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Security & Sound Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Password Update */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Account Password</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            {passwordSuccess && (
              <p className="text-xs font-bold text-emerald-600">Password updated successfully!</p>
            )}

            <button
              type="submit"
              disabled={!newPassword || newPassword.length < 6}
              className="w-full py-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Audio & App Preferences */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <Volume2 className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Sound & AI Engine</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <span className="font-bold text-slate-800 block">Focus & Task Chimes</span>
                <span className="text-[11px] text-slate-400">Play pleasant alerts on timer completion</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleSound(!soundEnabled)}
                className={`h-6 w-11 rounded-full transition-colors relative ${
                  soundEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-bold text-slate-800 block">AI Engine Status</span>
                <span className="text-[11px] text-slate-400">Active intelligence provider</span>
              </div>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {aiStatus.provider}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management & Sample Data Reset */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900">Data Management</h3>
        <p className="text-xs text-slate-500">
          Export your entire academic database as a JSON backup or restore default sample coursework.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleBackupExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all coursework to realistic demo data for Alex Rivera?')) {
                resetToSampleData();
                soundManager.playSuccess();
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Realistic Demo Data</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors ml-auto cursor-pointer"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
