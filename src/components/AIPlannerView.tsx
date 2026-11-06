import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  RotateCw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sliders,
  Play,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  Coffee,
  Download,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { TimetableSlot, Priority } from '../types';
import { soundManager } from '../utils/audio';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AIPlannerView: React.FC = () => {
  const {
    timetable,
    setTimetable,
    toggleSlotCompleted,
    deleteTimetableSlot,
    addTimetableSlot,
    updateTimetableSlot,
    subjects,
    exams,
    assignments,
    user,
    setActiveTab,
    setActiveFocusTarget
  } = useApp();

  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Planner inputs
  const [dailyHours, setDailyHours] = useState<number>(user?.dailyStudyGoal || 4.5);
  const [preferredTimes, setPreferredTimes] = useState('Evening (5:00 PM - 9:30 PM)');
  const [sessionLength, setSessionLength] = useState<number>(45);
  const [selectedDifficultyWeight, setSelectedDifficultyWeight] = useState(true);

  // Manual Add/Edit Slot Modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [slotDay, setSlotDay] = useState('Monday');
  const [slotStartTime, setSlotStartTime] = useState('17:00');
  const [slotEndTime, setSlotEndTime] = useState('17:45');
  const [slotSubject, setSlotSubject] = useState(subjects[0]?.name || 'Core Engineering');
  const [slotTopic, setSlotTopic] = useState('');
  const [slotType, setSlotType] = useState<'Study' | 'Revision' | 'Assignment' | 'Lab'>('Study');
  const [slotPriority, setSlotPriority] = useState<Priority>('High');

  // Trigger Intelligent Timetable Generation
  const handleGenerateTimetable = async () => {
    setIsGenerating(true);
    soundManager.playTick();

    try {
      const response = await fetch('/api/ai/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyHours,
          subjects,
          exams,
          assignments,
          preferredTimes,
          sessionLength
        })
      });

      const data = await response.json();
      if (data && Array.isArray(data.schedule) && data.schedule.length > 0) {
        setTimetable(data.schedule);
        soundManager.playSuccess();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (e) {
      console.warn('Timetable generation request failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSlotToggle = (slotId: string, currentCompleted: boolean) => {
    toggleSlotCompleted(slotId);
    if (!currentCompleted) {
      soundManager.playSuccess();
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    }
  };

  const handleOpenAddSlot = () => {
    setEditingSlot(null);
    setSlotDay(selectedDay);
    setSlotStartTime('17:00');
    setSlotEndTime('17:45');
    setSlotSubject(subjects[0]?.name || 'Core Engineering');
    setSlotTopic('');
    setSlotType('Study');
    setSlotPriority('High');
    setIsSlotModalOpen(true);
  };

  const handleOpenEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setSlotDay(slot.day);
    setSlotStartTime(slot.startTime);
    setSlotEndTime(slot.endTime);
    setSlotSubject(slot.subject);
    setSlotTopic(slot.topic);
    setSlotType(slot.type);
    setSlotPriority(slot.priority);
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotTopic.trim()) return;

    if (editingSlot) {
      updateTimetableSlot(editingSlot.id, {
        day: slotDay,
        startTime: slotStartTime,
        endTime: slotEndTime,
        subject: slotSubject,
        topic: slotTopic.trim(),
        type: slotType,
        priority: slotPriority
      });
    } else {
      addTimetableSlot({
        day: slotDay,
        startTime: slotStartTime,
        endTime: slotEndTime,
        subject: slotSubject,
        topic: slotTopic.trim(),
        type: slotType,
        priority: slotPriority,
        completed: false
      });
    }
    setIsSlotModalOpen(false);
  };

  const handleStartFocus = (slot: TimetableSlot) => {
    setActiveFocusTarget({
      subjectName: slot.subject,
      taskName: slot.topic
    });
    setActiveTab('pomodoro');
  };

  const handleCopySchedule = () => {
    const text = timetable
      .filter((s) => s.day === selectedDay)
      .map((s) => `${s.startTime} - ${s.endTime} | [${s.type}] ${s.subject}: ${s.topic}`)
      .join('\n');

    navigator.clipboard.writeText(`${selectedDay} Study Schedule:\n` + text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const daySlots = timetable
    .filter((s) => s.day.toLowerCase() === selectedDay.toLowerCase())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const completedCount = daySlots.filter((s) => s.completed).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Generator Controls */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Intelligent Schedule Synthesis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">AI Study Timetable Generator</h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
              Algorithms synthesize your difficult courses, impending exam countdowns, and assignment deadlines into a balanced, break-spaced weekly plan.
            </p>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleGenerateTimetable}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2.5 rounded-2xl bg-white px-5 py-3 text-xs sm:text-sm font-extrabold text-indigo-700 shadow-lg hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RotateCw className={`h-4 w-4 text-purple-600 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing Schedule...' : 'Regenerate AI Timetable'}</span>
          </button>
        </div>

        {/* Input Tuning Grid */}
        <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Daily Study Hours */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15">
            <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block mb-1">
              Daily Target Hours
            </label>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-white">{dailyHours} hrs/day</span>
              <div className="flex items-center gap-1">
                {[3, 4.5, 6].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDailyHours(h)}
                    className={`px-2 py-1 text-[11px] font-bold rounded-lg ${
                      dailyHours === h ? 'bg-white text-indigo-700' : 'bg-white/20 text-white'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preferred Study Time Window */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15">
            <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block mb-1">
              Peak Focus Window
            </label>
            <select
              value={preferredTimes}
              onChange={(e) => setPreferredTimes(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="Morning (8:00 AM - 12:30 PM)" className="text-slate-900">
                Morning (8:00 AM - 12:30 PM)
              </option>
              <option value="Afternoon (2:00 PM - 6:30 PM)" className="text-slate-900">
                Afternoon (2:00 PM - 6:30 PM)
              </option>
              <option value="Evening (5:00 PM - 9:30 PM)" className="text-slate-900">
                Evening (5:00 PM - 9:30 PM)
              </option>
              <option value="Night Owl (8:00 PM - 12:00 AM)" className="text-slate-900">
                Night Owl (8:00 PM - 12:00 AM)
              </option>
            </select>
          </div>

          {/* Session Block Duration */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15">
            <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block mb-1">
              Session Duration
            </label>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{sessionLength}m + 15m Break</span>
              <div className="flex items-center gap-1">
                {[30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSessionLength(m)}
                    className={`px-2 py-1 text-[11px] font-bold rounded-lg ${
                      sessionLength === m ? 'bg-white text-indigo-700' : 'bg-white/20 text-white'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hard Subjects Weighting */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block">
                Hard Course Bias
              </span>
              <span className="text-xs text-white font-medium">+40% time for Hard</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDifficultyWeight(!selectedDifficultyWeight)}
              className={`h-6 w-11 rounded-full transition-colors relative ${
                selectedDifficultyWeight ? 'bg-emerald-400' : 'bg-white/30'
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  selectedDifficultyWeight ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2">
        <div className="flex items-center gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            const slotsForDay = timetable.filter((s) => s.day.toLowerCase() === day.toLowerCase());
            const doneForDay = slotsForDay.filter((s) => s.completed).length;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-center px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{day.substring(0, 3)}</span>
                <span
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-indigo-300' : 'text-slate-400'
                  }`}
                >
                  {doneForDay}/{slotsForDay.length} done
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopySchedule}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleOpenAddSlot}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Timetable Schedule Cards for Selected Day */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">{selectedDay} Study Schedule</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {daySlots.length} sessions scheduled ({completedCount} completed)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Pacing:</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              45m Focus + 15m Recharge
            </span>
          </div>
        </div>

        {daySlots.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No sessions scheduled for {selectedDay}</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Click "Add Slot" or "Regenerate AI Timetable" to populate.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {daySlots.map((slot, index) => (
              <React.Fragment key={slot.id}>
                <div
                  className={`group rounded-2xl border p-4 sm:p-5 transition-all ${
                    slot.completed
                      ? 'bg-slate-50/60 border-slate-200/80 opacity-75'
                      : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleSlotToggle(slot.id, slot.completed)}
                        className={`mt-0.5 h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                          slot.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 bg-white hover:border-indigo-500'
                        }`}
                      >
                        {slot.completed && <CheckCircle2 className="h-4 w-4" />}
                      </button>

                      {/* Details */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{slot.subject}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              slot.type === 'Revision'
                                ? 'bg-purple-100 text-purple-700'
                                : slot.type === 'Assignment'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {slot.type}
                          </span>
                          {slot.priority === 'High' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                              High Priority
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-xs mt-1 font-medium ${
                            slot.completed ? 'line-through text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {slot.topic}
                        </p>
                      </div>
                    </div>

                    {/* Time & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-extrabold text-slate-900 block">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">45 Minutes</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!slot.completed && (
                          <button
                            onClick={() => handleStartFocus(slot)}
                            title="Launch Pomodoro Focus Sprint"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span className="hidden xs:inline">Focus</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEditSlot(slot)}
                          title="Edit slot"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => deleteTimetableSlot(slot.id)}
                          title="Delete slot"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 15-Minute Short Break Divider between sessions */}
                {index < daySlots.length - 1 && (
                  <div className="flex items-center justify-center gap-2 py-1 text-slate-400">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                      <Coffee className="h-3 w-3 text-amber-600" />
                      <span>15 min Recharge & Hydration Break</span>
                    </div>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Manual Slot Edit / Add Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-100">
              {editingSlot ? 'Edit Study Block' : 'Add Study Block'}
            </h3>

            <form onSubmit={handleSaveSlot} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week</label>
                <select
                  value={slotDay}
                  onChange={(e) => setSlotDay(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none bg-white"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={slotSubject}
                  onChange={(e) => setSlotSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Objective *</label>
                <input
                  type="text"
                  value={slotTopic}
                  onChange={(e) => setSlotTopic(e.target.value)}
                  placeholder="e.g. Dijkstra Shortest Path Algorithm"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Session Type</label>
                  <select
                    value={slotType}
                    onChange={(e) => setSlotType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none bg-white"
                  >
                    <option value="Study">Study (Core Theory)</option>
                    <option value="Revision">Revision (Exam Prep)</option>
                    <option value="Assignment">Assignment Work</option>
                    <option value="Lab">Lab Practical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={slotPriority}
                    onChange={(e) => setSlotPriority(e.target.value as Priority)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Save Study Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
