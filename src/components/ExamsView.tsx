import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Target,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Exam, RevisionStatus } from '../types';

export const ExamsView: React.FC = () => {
  const {
    exams,
    subjects,
    addExam,
    updateExam,
    deleteExam,
    updateExamRevisionStatus,
    setActiveTab,
    setActiveFocusTarget
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:30');
  const [location, setLocation] = useState('');
  const [syllabusDetails, setSyllabusDetails] = useState('');
  const [targetScore, setTargetScore] = useState('90+');
  const [revisionStatus, setRevisionStatus] = useState<RevisionStatus>('Not Started');

  // Real-time ticking clock for countdown precision
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenAdd = () => {
    setEditingExam(null);
    setName('');
    setSubjectId(subjects[0]?.id || '');
    // Default 10 days ahead
    const d = new Date();
    d.setDate(d.getDate() + 10);
    setDate(d.toISOString().split('T')[0]);
    setTime('09:30');
    setLocation('Tech Hall 101');
    setSyllabusDetails('Units 1-4: Core theorems, derivations, and problem sets.');
    setTargetScore('90+');
    setRevisionStatus('In Revision');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setName(exam.name);
    setSubjectId(exam.subjectId);
    setDate(exam.date);
    setTime(exam.time);
    setLocation(exam.location || '');
    setSyllabusDetails(exam.syllabusDetails || '');
    setTargetScore(exam.targetScore || '90+');
    setRevisionStatus(exam.revisionStatus);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;

    const matchedSubject = subjects.find((s) => s.id === subjectId) || subjects[0];
    const subjectName = matchedSubject ? matchedSubject.name : 'Engineering Course';

    if (editingExam) {
      updateExam(editingExam.id, {
        name: name.trim(),
        subjectId,
        subjectName,
        date,
        time,
        location: location.trim(),
        syllabusDetails: syllabusDetails.trim(),
        targetScore: targetScore.trim(),
        revisionStatus
      });
    } else {
      addExam({
        name: name.trim(),
        subjectId: matchedSubject?.id || 'sub_gen',
        subjectName,
        date,
        time,
        location: location.trim(),
        syllabusDetails: syllabusDetails.trim(),
        targetScore: targetScore.trim(),
        revisionStatus
      });
    }
    setIsModalOpen(false);
  };

  // Countdown Calculator
  const getExamCountdown = (examDateStr: string, examTimeStr: string) => {
    const examDateTime = new Date(`${examDateStr}T${examTimeStr || '09:00'}:00`).getTime();
    const diff = examDateTime - currentTime;

    if (diff <= 0) {
      return { isPassed: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { isPassed: false, days, hours, minutes, seconds };
  };

  const sortedExams = [...exams].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Examination Hub</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time exam countdowns, syllabus scope, target goals, and automated revision scheduling.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule New Exam</span>
        </button>
      </div>

      {/* Featured Nearest Exam Banner */}
      {sortedExams.length > 0 && (
        (() => {
          const nearest = sortedExams.find((e) => e.revisionStatus !== 'Completed') || sortedExams[0];
          const cd = getExamCountdown(nearest.date, nearest.time);

          return (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white shadow-xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/30 border border-indigo-400/40 px-3 py-1 text-xs font-bold text-indigo-200">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Next High-Priority Milestone</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">{nearest.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Subject: <strong className="text-white">{nearest.subjectName}</strong> • Target Score:{' '}
                    <strong className="text-emerald-400">{nearest.targetScore || '90+'}</strong>
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{nearest.location || 'College Examination Center'}</span>
                  </p>
                </div>

                {/* Live Countdown Display */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex flex-col items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                    <span className="text-xl sm:text-2xl font-black text-white">{cd.days}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Days</span>
                  </div>

                  <span className="text-xl font-bold text-white/50">:</span>

                  <div className="flex flex-col items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                    <span className="text-xl sm:text-2xl font-black text-white">
                      {cd.hours.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hours</span>
                  </div>

                  <span className="text-xl font-bold text-white/50">:</span>

                  <div className="flex flex-col items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                    <span className="text-xl sm:text-2xl font-black text-white">
                      {cd.minutes.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mins</span>
                  </div>

                  <span className="text-xl font-bold text-white/50">:</span>

                  <div className="flex flex-col items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                    <span className="text-xl sm:text-2xl font-black text-purple-300">
                      {cd.seconds.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Secs</span>
                  </div>
                </div>

                <div className="flex flex-wrap lg:flex-col gap-2">
                  <button
                    onClick={() => {
                      setActiveFocusTarget({
                        subjectName: nearest.subjectName,
                        taskName: `${nearest.name} Revision Sprint`
                      });
                      setActiveTab('pomodoro');
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-purple-600 hover:to-indigo-600 transition-all cursor-pointer"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Focus Revision</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('planner')}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <span>Generate AI Cram Plan</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Examination Timeline List */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
          Upcoming Examination Calendar ({sortedExams.length})
        </h3>

        {sortedExams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-extrabold text-slate-800">No exams scheduled</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Add your midterms, finals, or lab practicals to generate intelligent revision study blocks.
            </p>
            <button
              onClick={handleOpenAdd}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
            >
              Add First Exam
            </button>
          </div>
        ) : (
          sortedExams.map((exam) => {
            const cd = getExamCountdown(exam.date, exam.time);
            return (
              <div
                key={exam.id}
                className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-indigo-300 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 shrink-0">
                      <GraduationCap className="h-6 w-6" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {exam.subjectName}
                        </span>

                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            exam.revisionStatus === 'Ready'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : exam.revisionStatus === 'In Revision'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : exam.revisionStatus === 'Completed'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          Status: {exam.revisionStatus}
                        </span>

                        {exam.targetScore && (
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <Target className="h-3 w-3 text-indigo-600" />
                            Target: {exam.targetScore}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">{exam.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                          {exam.date} at {exam.time}
                        </span>
                        {exam.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {exam.location}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Countdown Badge & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right">
                      {cd.isPassed ? (
                        <span className="text-xs font-bold text-slate-400 px-3 py-1 rounded-full bg-slate-100">
                          Exam Completed
                        </span>
                      ) : (
                        <div>
                          <div className="text-sm sm:text-base font-black text-indigo-600">
                            {cd.days}d {cd.hours}h {cd.minutes}m {cd.seconds}s
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Time Until Paper
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={exam.revisionStatus}
                        onChange={(e) =>
                          updateExamRevisionStatus(exam.id, e.target.value as RevisionStatus)
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:border-indigo-600 focus:outline-none"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Revision">In Revision</option>
                        <option value="Ready">Ready / Confident</option>
                        <option value="Completed">Exam Completed</option>
                      </select>

                      <button
                        onClick={() => handleOpenEdit(exam)}
                        title="Edit exam details"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => deleteExam(exam.id)}
                        title="Delete exam"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Syllabus details */}
                {exam.syllabusDetails && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <span className="font-bold text-slate-800">Syllabus Scope: </span>
                    {exam.syllabusDetails}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingExam ? 'Edit Examination' : 'Schedule New Exam'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exam Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mid-Semester Exam: Data Structures"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Score</label>
                  <input
                    type="text"
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value)}
                    placeholder="e.g. 95+ or Grade A"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exam Hall / Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hall 3B, Tech Block or Online LMS"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Syllabus Information</label>
                <textarea
                  rows={3}
                  value={syllabusDetails}
                  onChange={(e) => setSyllabusDetails(e.target.value)}
                  placeholder="Specify covered chapters, critical derivations, high-weightage problem categories..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Revision Status</label>
                <select
                  value={revisionStatus}
                  onChange={(e) => setRevisionStatus(e.target.value as RevisionStatus)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Revision">In Revision</option>
                  <option value="Ready">Ready / Confident</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
                >
                  {editingExam ? 'Update Exam' : 'Schedule Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
