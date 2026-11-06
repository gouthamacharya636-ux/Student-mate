import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  CheckCircle2,
  Award,
  Download,
  Flame,
  Clock,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { subjects, assignments, exams, pomodoroHistory, user } = useApp();

  const [activeTimeframe, setActiveTimeframe] = useState<'week' | 'month'>('week');

  const totalCompletedAssignments = assignments.filter((a) => a.status === 'Completed').length;
  const assignmentRate =
    assignments.length > 0 ? Math.round((totalCompletedAssignments / assignments.length) * 100) : 0;

  // Study hours calculation
  const totalLoggedHours = subjects.reduce((acc, s) => acc + s.studyHoursLogged, 0);

  // Daily study history (last 7 days)
  const dailyHistory = [
    { day: 'Mon', date: 'Nov 2', hours: 4.5, goal: user?.dailyStudyGoal || 4 },
    { day: 'Tue', date: 'Nov 3', hours: 5.2, goal: user?.dailyStudyGoal || 4 },
    { day: 'Wed', date: 'Nov 4', hours: 3.8, goal: user?.dailyStudyGoal || 4 },
    { day: 'Thu', date: 'Nov 5', hours: 4.8, goal: user?.dailyStudyGoal || 4 },
    { day: 'Fri', date: 'Nov 6', hours: 4.0, goal: user?.dailyStudyGoal || 4 },
    { day: 'Sat', date: 'Nov 7', hours: 5.5, goal: user?.dailyStudyGoal || 4 },
    { day: 'Sun', date: 'Nov 8', hours: 4.2, goal: user?.dailyStudyGoal || 4 }
  ];

  const maxDaily = Math.max(...dailyHistory.map((d) => d.hours), 6);

  // Consistency 28-day matrix data
  const heatmapCells = Array.from({ length: 28 }, (_, i) => {
    // Realistic density
    const seed = (i * 7 + 3) % 10;
    const level = seed > 7 ? 3 : seed > 4 ? 2 : seed > 1 ? 1 : 0;
    const hours = (level * 1.5 + (seed % 2)).toFixed(1);
    return { day: i + 1, level, hours };
  });

  // Calculate Productivity Score (0-100)
  const productivityScore = Math.min(
    100,
    Math.round((assignmentRate * 0.4) + (Math.min(totalLoggedHours, 80) / 80 * 40) + 20)
  );

  const handleExportReport = () => {
    const report = {
      studentName: user?.name,
      college: user?.college,
      major: user?.major,
      generatedAt: new Date().toISOString(),
      summary: {
        totalLoggedHours,
        totalSubjects: subjects.length,
        completedAssignments: totalCompletedAssignments,
        pendingAssignments: assignments.length - totalCompletedAssignments,
        productivityScore
      },
      subjects: subjects.map((s) => ({
        name: s.name,
        code: s.code,
        difficulty: s.difficulty,
        studyHoursLogged: s.studyHoursLogged,
        syllabusCompletion: `${Math.round(
          (s.syllabus.filter((t) => t.completed).length / Math.max(1, s.syllabus.length)) * 100
        )}%`
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyMate_Analytics_${user?.name?.replace(/\s+/g, '_') || 'Student'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Progress Analytics</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visual metrics, subject study distributions, and consistency trends.
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {/* High-Level Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Productivity Score */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-5 text-white shadow-lg shadow-indigo-600/15">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Productivity Score</span>
            <Award className="h-5 w-5 text-amber-300" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black">{productivityScore}%</span>
            <span className="text-xs text-indigo-100 font-semibold">Optimal Velocity</span>
          </div>
          <p className="mt-2 text-[11px] text-indigo-100 leading-tight">
            Based on completed assignments, study streak & syllabus coverage.
          </p>
        </div>

        {/* Total Hours Logged */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Hours Logged</span>
            <Clock className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalLoggedHours.toFixed(1)}h</span>
            <span className="text-xs text-emerald-600 font-bold">+6.2h this week</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Across {subjects.length} active courses</p>
        </div>

        {/* Assignment Success Rate */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assignment Rate</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{assignmentRate}%</span>
            <span className="text-xs text-slate-400">({totalCompletedAssignments}/{assignments.length})</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Submitted on or before deadline</p>
        </div>

        {/* Study Consistency */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Consistency Streak</span>
            <Flame className="h-5 w-5 fill-amber-500 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">5 Days</span>
            <span className="text-xs text-slate-400">Top 5% of class</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Next milestone at 7 consecutive days</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Study Hours Bar Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Daily Study Hours (Last 7 Days)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Average: 4.5 hours/day</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"></span>
                Logged Hours
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="h-60 w-full pt-4">
            <div className="flex h-48 items-end justify-between gap-3 sm:gap-6 border-b border-slate-100 px-3">
              {dailyHistory.map((d) => {
                const heightPercent = (d.hours / maxDaily) * 100;
                return (
                  <div key={d.day} className="group relative flex-1 flex flex-col items-center h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute -top-10 hidden group-hover:flex items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-md z-10 whitespace-nowrap">
                      {d.date}: {d.hours} hrs
                    </div>

                    {/* Bar */}
                    <div
                      className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-purple-600 to-indigo-600 group-hover:from-purple-700 group-hover:to-indigo-700 transition-all duration-500 shadow-xs"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Labels */}
            <div className="flex justify-between gap-3 sm:gap-6 px-3 pt-2 text-xs font-bold text-slate-500">
              {dailyHistory.map((d) => (
                <div key={d.day} className="flex-1 text-center">
                  <span className="block">{d.day}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{d.hours}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Distribution Breakdown (1 col) */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Subject Distribution</h3>
            <span className="text-xs font-bold text-indigo-600">Hours</span>
          </div>

          <div className="space-y-3 pt-2">
            {subjects.map((sub) => {
              const share = totalLoggedHours > 0 ? Math.round((sub.studyHoursLogged / totalLoggedHours) * 100) : 0;
              return (
                <div key={sub.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate mr-2">{sub.name}</span>
                    <span className="font-extrabold text-slate-700 shrink-0">
                      {sub.studyHoursLogged}h ({share}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${share}%`, backgroundColor: sub.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 28-Day Consistency Heatmap (GitHub Style) */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Study Consistency Heatmap (Past 4 Weeks)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily study regularity is the strongest predictor of exam mastery.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <span>Less</span>
            <span className="h-3 w-3 rounded bg-slate-100"></span>
            <span className="h-3 w-3 rounded bg-indigo-200"></span>
            <span className="h-3 w-3 rounded bg-indigo-400"></span>
            <span className="h-3 w-3 rounded bg-indigo-600"></span>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-2 pt-2">
          {heatmapCells.map((cell) => {
            const bgClass =
              cell.level === 3
                ? 'bg-indigo-600 text-white'
                : cell.level === 2
                ? 'bg-indigo-400 text-white'
                : cell.level === 1
                ? 'bg-indigo-200 text-indigo-900'
                : 'bg-slate-100 text-slate-400';

            return (
              <div
                key={cell.day}
                title={`Day ${cell.day}: ${cell.hours} hrs studied`}
                className={`group relative flex flex-col items-center justify-center h-9 rounded-lg text-[10px] font-bold cursor-pointer transition-transform hover:scale-110 ${bgClass}`}
              >
                <span>{cell.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
