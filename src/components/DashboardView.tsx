import React from 'react';
import {
  BookOpen,
  CheckSquare,
  GraduationCap,
  Clock,
  Calendar,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  Flame,
  TrendingUp,
  Plus,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/audio';

export const DashboardView: React.FC = () => {
  const {
    user,
    subjects,
    assignments,
    exams,
    timetable,
    toggleSlotCompleted,
    toggleAssignmentStatus,
    setActiveTab,
    setActiveFocusTarget
  } = useApp();

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const formattedToday = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate statistics
  const totalSubjects = subjects.length;
  const pendingAssignments = assignments.filter((a) => a.status !== 'Completed');
  const completedAssignments = assignments.filter((a) => a.status === 'Completed');
  const upcomingExams = exams.filter((e) => e.revisionStatus !== 'Completed');

  // Study progress today
  // Find slots for today
  const todaySlots = timetable.filter((slot) => slot.day.toLowerCase() === todayName.toLowerCase());
  const completedTodaySlots = todaySlots.filter((slot) => slot.completed).length;
  const loggedTodayMinutes = completedTodaySlots * 45;
  const dailyGoalHours = user?.dailyStudyGoal || 4.5;
  const dailyGoalMinutes = dailyGoalHours * 60;
  const progressPercent = Math.min(100, Math.round((loggedTodayMinutes / dailyGoalMinutes) * 100));

  // Upcoming deadlines in the next 10 days
  const upcomingDeadlines = [
    ...pendingAssignments.map((a) => ({
      id: a.id,
      title: a.title,
      subject: a.subjectName,
      date: a.dueDate,
      type: 'assignment' as const,
      priority: a.priority
    })),
    ...upcomingExams.map((e) => ({
      id: e.id,
      title: e.name,
      subject: e.subjectName,
      date: e.date,
      type: 'exam' as const,
      priority: 'High' as const
    }))
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  // Weekly study data for the SVG bar chart (hours studied)
  const weeklyData = [
    { day: 'Mon', hours: 4.2, goal: dailyGoalHours },
    { day: 'Tue', hours: 5.0, goal: dailyGoalHours },
    { day: 'Wed', hours: 3.5, goal: dailyGoalHours },
    { day: 'Thu', hours: 4.8, goal: dailyGoalHours },
    { day: 'Fri', hours: 3.8, goal: dailyGoalHours },
    { day: 'Sat', hours: 5.5, goal: dailyGoalHours },
    { day: 'Sun', hours: 4.0, goal: dailyGoalHours }
  ];

  const maxHours = Math.max(...weeklyData.map((d) => d.hours), dailyGoalHours) + 1;

  const handleSlotToggle = (slotId: string, currentCompleted: boolean) => {
    toggleSlotCompleted(slotId);
    if (!currentCompleted) {
      soundManager.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const handleStartFocus = (subjectName: string, taskName: string) => {
    setActiveFocusTarget({ subjectName, taskName });
    setActiveTab('pomodoro');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute right-20 -bottom-10 h-48 w-48 rounded-full bg-indigo-400/20 blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Calendar className="h-3.5 w-3.5" />
              <span>{todayName}, {formattedToday}</span>
              <span className="h-1 w-1 rounded-full bg-white/60"></span>
              <span className="text-amber-300 flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 fill-amber-300" /> 5-day streak
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {user?.name || 'Alex'}! 👋
            </h2>
            <p className="text-sm text-indigo-100 max-w-xl">
              You have <span className="font-bold text-white">{pendingAssignments.length} pending assignments</span> and{' '}
              <span className="font-bold text-white">{upcomingExams.length} upcoming exams</span> scheduled. Your timetable recommends 3 focused study blocks today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('planner')}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-md hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>AI Study Planner</span>
            </button>
            <button
              onClick={() => setActiveTab('pomodoro')}
              className="flex items-center gap-2 rounded-xl bg-indigo-500/40 border border-white/30 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500/60 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Start Timer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Subjects */}
        <div
          onClick={() => setActiveTab('subjects')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Subjects</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalSubjects}</span>
            <span className="text-xs font-medium text-slate-400">Enrolled courses</span>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-indigo-600">
            <span>Manage syllabus</span>
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </div>

        {/* Pending Assignments */}
        <div
          onClick={() => setActiveTab('assignments')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{pendingAssignments.length}</span>
            <span className="text-xs font-medium text-slate-400">Due this semester</span>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-amber-600">
            <span>{assignments.filter(a => a.priority === 'High' && a.status !== 'Completed').length} High priority</span>
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </div>

        {/* Completed Assignments */}
        <div
          onClick={() => setActiveTab('assignments')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{completedAssignments.length}</span>
            <span className="text-xs font-medium text-slate-400">
              ({assignments.length > 0 ? Math.round((completedAssignments.length / assignments.length) * 100) : 0}% done)
            </span>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
            <span>View submissions</span>
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </div>

        {/* Upcoming Exams */}
        <div
          onClick={() => setActiveTab('exams')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Exams</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{upcomingExams.length}</span>
            <span className="text-xs font-medium text-slate-400">Nearest in 5d</span>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-indigo-600">
            <span>Live countdowns</span>
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </div>
      </div>

      {/* Daily Study Progress Bar Card */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">Today's Study Progress</h3>
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700">
                {progressPercent}% Complete
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged {(loggedTodayMinutes / 60).toFixed(1)} hrs of your daily {dailyGoalHours} hrs target
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('pomodoro')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
            >
              <Clock className="h-3.5 w-3.5 text-indigo-600" />
              <span>Log Study Block</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 transition-all duration-700 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>0 hrs</span>
          <span>Target: {dailyGoalHours} hrs/day</span>
          <span className={progressPercent >= 100 ? 'text-emerald-600 font-bold' : ''}>
            {progressPercent >= 100 ? '🎉 Goal Achieved!' : `${((dailyGoalMinutes - loggedTodayMinutes) / 60).toFixed(1)} hrs remaining`}
          </span>
        </div>
      </div>

      {/* Main Content Split: Today's Schedule & Weekly Chart + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Study Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">Today's Study Schedule ({todayName})</h3>
              </div>
              <button
                onClick={() => setActiveTab('planner')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {todaySlots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No scheduled sessions for today</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Generate your intelligent study schedule with the AI Planner.</p>
                <button
                  onClick={() => setActiveTab('planner')}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Generate Plan Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all ${
                      slot.completed
                        ? 'bg-slate-50/70 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <button
                        onClick={() => handleSlotToggle(slot.id, slot.completed)}
                        className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                          slot.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 bg-white hover:border-indigo-500'
                        }`}
                      >
                        {slot.completed && <CheckCircle2 className="h-4 w-4" />}
                      </button>

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-extrabold ${
                              slot.completed ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {slot.subject}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {slot.type}
                          </span>
                          {slot.priority === 'High' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                              High Priority
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{slot.topic}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700 block">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="text-[10px] text-slate-400">45 mins</span>
                      </div>

                      {!slot.completed && (
                        <button
                          onClick={() => handleStartFocus(slot.subject, slot.topic)}
                          title="Start Focus Timer on this topic"
                          className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Productivity Visual Chart */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-base font-extrabold text-slate-900">Weekly Study Velocity</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Total: 30.8 hours studied this week (108% of target)</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                +14% vs Last Week
              </span>
            </div>

            {/* SVG Responsive Bar Chart */}
            <div className="h-52 w-full pt-4">
              <div className="flex h-40 items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200">
                {weeklyData.map((d) => {
                  const barHeight = (d.hours / maxHours) * 100;
                  const isToday = d.day === todayName.substring(0, 3);
                  return (
                    <div key={d.day} className="group relative flex-1 flex flex-col items-center h-full justify-end">
                      {/* Tooltip */}
                      <div className="absolute -top-9 hidden group-hover:flex items-center justify-center rounded-md bg-slate-900 px-2 py-1 text-[11px] font-bold text-white shadow-md z-10 whitespace-nowrap">
                        {d.hours} hrs ({Math.round((d.hours / d.goal) * 100)}%)
                      </div>

                      {/* Bar */}
                      <div
                        className={`w-full max-w-[36px] rounded-t-lg transition-all duration-500 ${
                          isToday
                            ? 'bg-gradient-to-t from-purple-600 to-indigo-600 shadow-sm'
                            : 'bg-indigo-100 group-hover:bg-indigo-200'
                        }`}
                        style={{ height: `${barHeight}%` }}
                      />

                      {/* Target line indicator dot if exceeded */}
                      {d.hours >= d.goal && (
                        <div className="absolute -top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Day Labels */}
              <div className="flex justify-between gap-2 sm:gap-4 px-2 pt-2 text-xs font-bold text-slate-500">
                {weeklyData.map((d) => {
                  const isToday = d.day === todayName.substring(0, 3);
                  return (
                    <span key={d.day} className={`flex-1 text-center ${isToday ? 'text-indigo-600 font-extrabold' : ''}`}>
                      {d.day}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Upcoming Deadlines & AI Quick Tip */}
        <div className="space-y-6">
          {/* Upcoming Deadlines Widget */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Upcoming Deadlines</h3>
              <span className="text-xs font-bold text-slate-400">Next 10 days</span>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No urgent deadlines pending!</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveTab(item.type === 'exam' ? 'exams' : 'assignments')}
                    className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.type === 'exam'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.type === 'exam' ? 'Exam' : 'Assignment'}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{item.date}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">{item.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{item.subject}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setActiveTab('assignments')}
              className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View All Coursework
            </button>
          </div>

          {/* AI Academic Mentor Insight Card */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/50 to-blue-50 p-6 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">StudyMate AI Strategy</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Your <strong>Data Structures Midterm</strong> is in 5 days. High-yield topics like AVL Trees and Dijkstra are primed for active recall. Schedule a 45-minute practice session tonight."
            </p>
            <button
              onClick={() => setActiveTab('assistant')}
              className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Ask AI Study Assistant</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
