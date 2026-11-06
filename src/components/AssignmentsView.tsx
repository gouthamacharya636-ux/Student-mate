import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  X,
  Play,
  ArrowUpDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Assignment, AssignmentStatus, Priority } from '../types';
import { soundManager } from '../utils/audio';

export const AssignmentsView: React.FC = () => {
  const {
    assignments,
    subjects,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleAssignmentStatus,
    setActiveTab,
    setActiveFocusTarget
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<Priority>('High');
  const [status, setStatus] = useState<AssignmentStatus>('Pending');
  const [submissionLink, setSubmissionLink] = useState('');

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setDescription('');
    // Default 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDueDate(d.toISOString().split('T')[0]);
    setDueTime('23:59');
    setPriority('High');
    setStatus('Pending');
    setSubmissionLink('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAssignment(asg);
    setTitle(asg.title);
    setSubjectId(asg.subjectId);
    setDescription(asg.description);
    setDueDate(asg.dueDate);
    setDueTime(asg.dueTime || '23:59');
    setPriority(asg.priority);
    setStatus(asg.status);
    setSubmissionLink(asg.submissionLink || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const matchedSubject = subjects.find((s) => s.id === subjectId) || subjects[0];
    const subjectName = matchedSubject ? matchedSubject.name : 'General Coursework';

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, {
        title: title.trim(),
        subjectId,
        subjectName,
        description: description.trim(),
        dueDate,
        dueTime,
        priority,
        status,
        submissionLink: submissionLink.trim() || undefined
      });
    } else {
      addAssignment({
        title: title.trim(),
        subjectId: matchedSubject?.id || 'gen',
        subjectName,
        description: description.trim(),
        dueDate,
        dueTime,
        priority,
        status,
        submissionLink: submissionLink.trim() || undefined
      });
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (asgId: string, currentStatus: AssignmentStatus) => {
    toggleAssignmentStatus(asgId);
    if (currentStatus !== 'Completed') {
      soundManager.playSuccess();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleStartFocus = (asg: Assignment) => {
    setActiveFocusTarget({
      subjectName: asg.subjectName,
      taskName: asg.title
    });
    setActiveTab('pomodoro');
  };

  // Filter & Search Logic
  const filteredAssignments = assignments
    .filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || a.priority === selectedPriority;
      const matchesSubject = selectedSubject === 'all' || a.subjectName === selectedSubject;

      return matchesSearch && matchesStatus && matchesPriority && matchesSubject;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'priority') {
        const pOrder: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };
        return pOrder[b.priority] - pOrder[a.priority];
      }
      return a.title.localeCompare(b.title);
    });

  // Urgency badge calculation
  const getDeadlineBadge = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dueDateStr);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)}d`, color: 'bg-rose-100 text-rose-800 font-bold' };
    }
    if (diffDays === 0) {
      return { text: 'Due Today 🔥', color: 'bg-amber-100 text-amber-800 font-bold' };
    }
    if (diffDays === 1) {
      return { text: 'Due Tomorrow', color: 'bg-amber-50 text-amber-700 font-semibold' };
    }
    if (diffDays <= 3) {
      return { text: `Due in ${diffDays} days`, color: 'bg-indigo-50 text-indigo-700 font-semibold' };
    }
    return { text: `Due in ${diffDays} days`, color: 'bg-slate-100 text-slate-600' };
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Assignment Manager</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize coursework deliverables, track deadlines, and schedule focus sprints.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments, topics, or subjects..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="dueDate">Sort by Deadline</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-4 pt-1 text-xs text-slate-500 font-semibold border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900">{filteredAssignments.length}</strong> assignments
          </span>
          <span>•</span>
          <span className="text-amber-600">
            {assignments.filter((a) => a.status === 'Pending').length} Pending
          </span>
          <span>•</span>
          <span className="text-indigo-600">
            {assignments.filter((a) => a.status === 'In Progress').length} In Progress
          </span>
          <span>•</span>
          <span className="text-emerald-600">
            {assignments.filter((a) => a.status === 'Completed').length} Done
          </span>
        </div>
      </div>

      {/* Assignment Cards List */}
      <div className="space-y-3.5">
        {filteredAssignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-slate-800">No assignments found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try resetting your filter parameters or search query.'
                : 'Great job! You have cleared all assignments.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
            >
              Create Assignment
            </button>
          </div>
        ) : (
          filteredAssignments.map((asg) => {
            const deadlineBadge = getDeadlineBadge(asg.dueDate);
            const isCompleted = asg.status === 'Completed';

            return (
              <div
                key={asg.id}
                className={`group rounded-2xl bg-white border p-4 sm:p-5 transition-all ${
                  isCompleted
                    ? 'border-slate-200/60 bg-slate-50/50 opacity-80'
                    : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3.5 overflow-hidden">
                    <button
                      onClick={() => handleToggleStatus(asg.id, asg.status)}
                      className={`mt-0.5 h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 bg-white hover:border-indigo-500'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {asg.subjectName}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            asg.priority === 'High'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : asg.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {asg.priority} Priority
                        </span>

                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${deadlineBadge.color}`}>
                          {deadlineBadge.text}
                        </span>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-extrabold ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {asg.title}
                      </h3>

                      {asg.description && (
                        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                          {asg.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions & Deadline Details */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center sm:justify-end gap-1.5 text-xs font-bold text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{asg.dueDate}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block sm:text-right">
                        Due by {asg.dueTime || '23:59'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isCompleted && (
                        <button
                          onClick={() => handleStartFocus(asg)}
                          title="Focus on this assignment in Pomodoro"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span className="hidden xs:inline">Focus</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(asg)}
                        title="Edit assignment"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => deleteAssignment(asg.id)}
                        title="Delete assignment"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dynamic Programming Lab Problem Set 3"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Associated Subject *</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                  >
                    <option value="High">High Priority (Urgent)</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Submission Deadline *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Time</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                >
                  <option value="Pending">Pending (Not Started)</option>
                  <option value="In Progress">In Progress (Active Work)</option>
                  <option value="Completed">Completed & Submitted</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Requirements</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline key rubric requirements, equations to derive, or lab simulation instructions..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Submission Portal Link (Optional)</label>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://classroom.google.com/c/..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
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
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
