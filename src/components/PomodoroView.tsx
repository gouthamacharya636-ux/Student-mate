import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Timer,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  Flame,
  Award,
  BookOpen,
  Coffee,
  BatteryCharging
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/audio';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const MODE_CONFIGS = {
  pomodoro: { label: 'Study Focus', defaultMinutes: 25, color: 'from-purple-600 to-indigo-600', icon: Timer },
  shortBreak: { label: 'Short Break', defaultMinutes: 5, color: 'from-emerald-500 to-teal-500', icon: Coffee },
  longBreak: { label: 'Long Break', defaultMinutes: 15, color: 'from-blue-500 to-cyan-500', icon: BatteryCharging }
};

export const PomodoroView: React.FC = () => {
  const {
    subjects,
    pomodoroHistory,
    logPomodoroSession,
    activeFocusTarget,
    setActiveFocusTarget,
    user
  } = useApp();

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'binaural' | 'rain' | 'whitenoise'>('none');

  // Task linking
  const [selectedSubject, setSelectedSubject] = useState(
    activeFocusTarget?.subjectName || subjects[0]?.name || 'General Study'
  );
  const [taskName, setTaskName] = useState(activeFocusTarget?.taskName || 'Deep Work Session');

  // Sync if activeFocusTarget changes
  useEffect(() => {
    if (activeFocusTarget?.subjectName) setSelectedSubject(activeFocusTarget.subjectName);
    if (activeFocusTarget?.taskName) setTaskName(activeFocusTarget.taskName);
  }, [activeFocusTarget]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Completed session
      setIsActive(false);
      soundManager.playSuccess();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });

      if (mode === 'pomodoro') {
        logPomodoroSession({
          subjectName: selectedSubject,
          taskName: taskName || 'Focus Sprint',
          durationMinutes: MODE_CONFIGS.pomodoro.defaultMinutes,
          mode: 'pomodoro'
        });
        // Switch to short break
        setMode('shortBreak');
        setTimeLeft(MODE_CONFIGS.shortBreak.defaultMinutes * 60);
      } else {
        // Break ended, switch back to pomodoro
        setMode('pomodoro');
        setTimeLeft(MODE_CONFIGS.pomodoro.defaultMinutes * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, selectedSubject, taskName, logPomodoroSession]);

  // Handle ambient sound change
  const handleAmbientChange = (type: 'none' | 'binaural' | 'rain' | 'whitenoise') => {
    setAmbientSound(type);
    soundManager.startAmbientSound(type);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODE_CONFIGS[newMode].defaultMinutes * 60);
  };

  const handleToggleTimer = () => {
    if (!isActive) {
      soundManager.playTick();
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(MODE_CONFIGS[mode].defaultMinutes * 60);
  };

  const handleSkip = () => {
    setIsActive(false);
    if (mode === 'pomodoro') {
      switchMode('shortBreak');
    } else {
      switchMode('pomodoro');
    }
  };

  // Time formatting
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalDuration = MODE_CONFIGS[mode].defaultMinutes * 60;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  // Daily Statistics
  const todayDateString = new Date().toISOString().split('T')[0];
  const todaySessions = pomodoroHistory.filter((s) => s.timestamp.startsWith(todayDateString));
  const completedPomodorosToday = todaySessions.filter((s) => s.mode === 'pomodoro').length;
  const totalMinutesStudiedToday = completedPomodorosToday * 25;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Focus Timer</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          High-intensity 25-minute Pomodoro study intervals designed to prevent cognitive fatigue.
        </p>
      </div>

      {/* Main Timer Glass Card */}
      <div className="rounded-3xl bg-white p-6 sm:p-10 border border-slate-200/90 shadow-xl shadow-indigo-600/5 text-center relative overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 mb-8">
          {(['pomodoro', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => {
            const isSelected = mode === m;
            const config = MODE_CONFIGS[m];
            const Icon = config.icon;
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Circular / Large Timer Display */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="relative flex flex-col items-center justify-center h-64 w-64 sm:h-72 sm:w-72 rounded-full border-8 border-slate-100 bg-gradient-to-b from-slate-50/50 to-white shadow-inner">
            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="4"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 - (282.7 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>

            {/* Time Number */}
            <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter tabular-nums z-10">
              {formattedTime}
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 mt-2 z-10">
              {isActive ? 'Session Active' : 'Ready'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 z-10 max-w-[160px] truncate">
              {taskName}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handleReset}
            title="Reset timer"
            className="p-3.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={handleToggleTimer}
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-indigo-600/30 hover:from-purple-700 hover:to-indigo-700 active:scale-95 transition-all cursor-pointer"
          >
            {isActive ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
            <span>{isActive ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={handleSkip}
            title="Skip to next session"
            className="p-3.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Link Current Focus Session to Subject & Task */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Focus Task / Goal</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Dijkstra Shortest Path Proofs"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Ambient Acoustic Generator Selection */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700">Ambient Acoustic Focus:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'none', label: 'Mute' },
              { id: 'binaural', label: '🧠 40Hz Gamma Tone' },
              { id: 'rain', label: '🌧️ Soft Rain' },
              { id: 'whitenoise', label: '📻 White Noise' }
            ].map((amb) => (
              <button
                key={amb.id}
                type="button"
                onClick={() => handleAmbientChange(amb.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  ambientSound === amb.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {amb.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Focus Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Completed Pomodoros */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{completedPomodorosToday}</span>
            <p className="text-xs font-semibold text-slate-500">Pomodoros Done Today</p>
          </div>
        </div>

        {/* Focus Minutes */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Timer className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-indigo-600">{totalMinutesStudiedToday}m</span>
            <p className="text-xs font-semibold text-slate-500">Deep Focus Logged</p>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Flame className="h-6 w-6 fill-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-amber-600">5 Days</span>
            <p className="text-xs font-semibold text-slate-500">Study Streak Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};
