import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  BarChart2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Subject, Difficulty } from '../types';
import { soundManager } from '../utils/audio';

const COLOR_OPTIONS = [
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#6366f1'  // Indigo
];

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    toggleSyllabusTopic,
    addSyllabusTopic,
    deleteSyllabusTopic,
    setActiveTab,
    setActiveFocusTarget
  } = useApp();

  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(subjects[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [credits, setCredits] = useState(3);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [newTopicInput, setNewTopicInput] = useState<{ [subjectId: string]: string }>({});

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setInstructor('');
    setCredits(3);
    setColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);
    setDifficulty('Medium');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code);
    setInstructor(sub.instructor || '');
    setCredits(sub.credits);
    setColor(sub.color);
    setDifficulty(sub.difficulty);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        instructor: instructor.trim(),
        credits: Number(credits),
        color,
        difficulty
      });
    } else {
      addSubject({
        name: name.trim(),
        code: code.trim().toUpperCase() || 'ENGR' + Math.floor(100 + Math.random() * 900),
        instructor: instructor.trim() || 'Faculty Instructor',
        credits: Number(credits),
        color,
        difficulty,
        syllabus: [
          { id: 'top_1_' + Date.now(), title: 'Introduction & Foundations', completed: true },
          { id: 'top_2_' + Date.now(), title: 'Theoretical Principles & Analysis', completed: false },
          { id: 'top_3_' + Date.now(), title: 'Practical Applications & Problem Sets', completed: false }
        ]
      });
    }
    setIsModalOpen(false);
  };

  const handleTopicCheck = (subId: string, topId: string, wasCompleted: boolean) => {
    toggleSyllabusTopic(subId, topId);
    if (!wasCompleted) {
      soundManager.playSuccess();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    }
  };

  const handleAddTopic = (subjectId: string) => {
    const text = newTopicInput[subjectId];
    if (text && text.trim()) {
      addSyllabusTopic(subjectId, text.trim());
      setNewTopicInput((prev) => ({ ...prev, [subjectId]: '' }));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Academic Curriculum</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your courses, track syllabus milestones, and calibrate difficulty for the AI Planner.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 gap-6">
        {subjects.map((sub) => {
          const isExpanded = expandedSubjectId === sub.id;
          const completedTopics = sub.syllabus.filter((t) => t.completed).length;
          const totalTopics = sub.syllabus.length;
          const syllabusProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

          return (
            <div
              key={sub.id}
              className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Subject Card Header */}
              <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Color Accent Indicator */}
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm shrink-0"
                    style={{ backgroundColor: sub.color }}
                  >
                    {sub.code ? sub.code.substring(0, 3) : <BookOpen className="h-6 w-6" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        {sub.code}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sub.difficulty === 'Hard'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : sub.difficulty === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {sub.difficulty} Difficulty
                      </span>
                      <span className="text-xs font-bold text-slate-500">{sub.credits} Credits</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">{sub.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Instructor: {sub.instructor || 'Faculty'}</p>
                  </div>
                </div>

                {/* Progress & Actions */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">Syllabus</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-sm font-extrabold text-slate-900">{syllabusProgress}%</span>
                        <span className="text-[10px] text-slate-400">({completedTopics}/{totalTopics})</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">Logged</span>
                      <span className="text-sm font-extrabold text-indigo-600 mt-0.5 block">
                        {sub.studyHoursLogged} hrs
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveFocusTarget({ subjectName: sub.name, taskName: `${sub.name} Study Session` });
                        setActiveTab('pomodoro');
                      }}
                      title="Focus on this subject"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors"
                    >
                      <Clock className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(sub)}
                      title="Edit subject"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSubject(sub.id)}
                      title="Delete subject"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                      className="flex items-center gap-1 p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition-colors"
                    >
                      <span>Syllabus</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar line */}
              <div className="h-1.5 w-full bg-slate-100">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${syllabusProgress}%`, backgroundColor: sub.color }}
                />
              </div>

              {/* Collapsible Syllabus Topics Section */}
              {isExpanded && (
                <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      Syllabus Topics & Exam Benchmarks ({completedTopics} of {totalTopics} completed)
                    </h4>
                    <span className="text-xs text-indigo-600 font-bold">
                      {syllabusProgress === 100 ? '🎉 Syllabus Complete!' : `${totalTopics - completedTopics} topics remaining`}
                    </span>
                  </div>

                  {/* Topics List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {sub.syllabus.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => handleTopicCheck(sub.id, topic.id, topic.completed)}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          topic.completed
                            ? 'bg-white/80 border-slate-200 text-slate-400'
                            : 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <button
                            type="button"
                            className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                              topic.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 hover:border-indigo-500'
                            }`}
                          >
                            {topic.completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5 text-transparent" />}
                          </button>
                          <span
                            className={`text-xs font-semibold truncate ${
                              topic.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {topic.title}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSyllabusTopic(sub.id, topic.id);
                          }}
                          className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Topic Input */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newTopicInput[sub.id] || ''}
                      onChange={(e) =>
                        setNewTopicInput((prev) => ({ ...prev, [sub.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTopic(sub.id);
                        }
                      }}
                      placeholder="Add new topic or chapter (e.g., Fourier Transform Properties)..."
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTopic(sub.id)}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shrink-0"
                    >
                      Add Topic
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Operating Systems"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CS302"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Credit Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Professor / Instructor</label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                  >
                    <option value="Easy">Easy (Standard Load)</option>
                    <option value="Medium">Medium (Balanced)</option>
                    <option value="Hard">Hard (+40% Study Blocks)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Card Color</label>
                  <div className="flex items-center gap-2 pt-1.5">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setColor(c)}
                        className={`h-7 w-7 rounded-full border-2 transition-transform ${
                          color === c ? 'scale-110 border-slate-900 ring-2 ring-indigo-200' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
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
                  {editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
