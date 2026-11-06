import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  StudentProfile,
  Subject,
  Assignment,
  Exam,
  TimetableSlot,
  PomodoroSession,
  AppNotification,
  ActiveTab,
  AssignmentStatus,
  RevisionStatus
} from '../types';
import {
  initialProfile,
  initialSubjects,
  initialAssignments,
  initialExams,
  initialTimetable,
  initialPomodoroHistory,
  initialNotifications
} from '../data/initialData';

interface AppContextType {
  // Auth & Profile
  user: StudentProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; college: string; major: string; semester: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  resetPassword: (email: string, newPass: string) => Promise<{ success: boolean; message?: string; error?: string }>;

  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Subjects
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'studyHoursLogged'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  toggleSyllabusTopic: (subjectId: string, topicId: string) => void;
  addSyllabusTopic: (subjectId: string, title: string) => void;
  deleteSyllabusTopic: (subjectId: string, topicId: string) => void;

  // Assignments
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  toggleAssignmentStatus: (id: string) => void;

  // Exams
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  updateExamRevisionStatus: (id: string, status: RevisionStatus) => void;

  // Timetable
  timetable: TimetableSlot[];
  setTimetable: (slots: TimetableSlot[]) => void;
  toggleSlotCompleted: (id: string) => void;
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;

  // Pomodoro
  pomodoroHistory: PomodoroSession[];
  logPomodoroSession: (session: Omit<PomodoroSession, 'id' | 'timestamp'>) => void;
  activeFocusTarget: { subjectName?: string; taskName?: string } | null;
  setActiveFocusTarget: (target: { subjectName?: string; taskName?: string } | null) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;

  // Utilities
  resetToSampleData: () => void;
  aiStatus: { hasApiKey: boolean; provider: string; mode: string };
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'studymate_v1_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(`${STORAGE_PREFIX}token`) || 'demo-token');
  const [user, setUser] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}profile`);
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFocusTarget, setActiveFocusTarget] = useState<{ subjectName?: string; taskName?: string } | null>(null);

  // Entities state
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}subjects`);
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}assignments`);
    return saved ? JSON.parse(saved) : initialAssignments;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}exams`);
    return saved ? JSON.parse(saved) : initialExams;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}timetable`);
    return saved ? JSON.parse(saved) : initialTimetable;
  });

  const [pomodoroHistory, setPomodoroHistory] = useState<PomodoroSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}pomodoro`);
    return saved ? JSON.parse(saved) : initialPomodoroHistory;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [aiStatus, setAiStatus] = useState({
    hasApiKey: false,
    provider: 'StudyMate Offline Engine',
    mode: 'offline'
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Save to localStorage on change
  useEffect(() => {
    if (user) localStorage.setItem(`${STORAGE_PREFIX}profile`, JSON.stringify(user));
    if (token) localStorage.setItem(`${STORAGE_PREFIX}token`, token);
  }, [user, token]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}subjects`, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}assignments`, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}exams`, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}timetable`, JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}pomodoro`, JSON.stringify(pomodoroHistory));
  }, [pomodoroHistory]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // Fetch AI status from backend
  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.provider) {
          setAiStatus(data);
        }
      })
      .catch(() => {
        // Offline fallback is always ready
      });
  }, []);

  // Sync with backend if logged in
  const syncWithBackend = useCallback(async () => {
    if (!token || token === 'demo-token') return;
    try {
      setIsSyncing(true);
      await fetch('/api/data/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          profile: user,
          subjects,
          assignments,
          exams,
          timetable,
          pomodoroHistory,
          notifications
        })
      });
    } catch (err) {
      console.warn('Backend sync paused (running local storage mode):', err);
    } finally {
      setIsSyncing(false);
    }
  }, [token, user, subjects, assignments, exams, timetable, pomodoroHistory, notifications]);

  // Debounced auto-sync
  useEffect(() => {
    const timer = setTimeout(() => {
      syncWithBackend();
    }, 2000);
    return () => clearTimeout(timer);
  }, [subjects, assignments, exams, timetable, pomodoroHistory, notifications, syncWithBackend]);

  // Auth operations
  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        // Fallback for demo login: if email is alex.rivera@techuni.edu or guest
        if (email.toLowerCase().includes('alex') || email.toLowerCase().includes('demo')) {
          setUser(initialProfile);
          setToken('demo-token');
          return { success: true };
        }
        return { success: false, error: data.error || 'Failed to login' };
      }

      setToken(data.token);
      setUser(data.user);
      if (data.data) {
        if (data.data.subjects) setSubjects(data.data.subjects);
        if (data.data.assignments) setAssignments(data.data.assignments);
        if (data.data.exams) setExams(data.data.exams);
        if (data.data.timetable) setTimetable(data.data.timetable);
        if (data.data.pomodoroHistory) setPomodoroHistory(data.data.pomodoroHistory);
        if (data.data.notifications) setNotifications(data.data.notifications);
      }
      return { success: true };
    } catch {
      // Local fallback login
      if (email.toLowerCase().includes('alex') || email.toLowerCase().includes('demo')) {
        setUser(initialProfile);
        setToken('demo-token');
        return { success: true };
      }
      return { success: false, error: 'Network issue. Try demo account or check connection.' };
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    college: string;
    major: string;
    semester: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setToken(data.token);
      setUser(data.user);
      // Give initial subjects for newly registered student
      setSubjects(initialSubjects);
      setAssignments(initialAssignments.slice(0, 3));
      setExams(initialExams.slice(0, 2));
      setTimetable(initialTimetable.slice(0, 7));
      setNotifications([
        {
          id: 'welcome_1',
          title: 'Welcome to StudyMate AI! 🎉',
          message: 'Your academic workspace is set up. Check your dashboard to begin.',
          type: 'system',
          timestamp: 'Just now',
          read: false,
          linkTab: 'dashboard'
        }
      ]);
      return { success: true };
    } catch {
      // Local registration fallback
      const newUser: StudentProfile = {
        id: 'usr_' + Date.now(),
        name: formData.name,
        email: formData.email,
        college: formData.college || 'Institute of Engineering',
        major: formData.major || 'Computer Science & Engineering',
        semester: formData.semester || '5th Semester',
        dailyStudyGoal: 4,
        avatarColor: 'from-purple-600 to-indigo-600',
        createdAt: new Date().toISOString()
      };
      setUser(newUser);
      setToken('tok_' + Date.now());
      setSubjects(initialSubjects);
      setAssignments(initialAssignments.slice(0, 3));
      return { success: true };
    }
  };

  const logout = () => {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
    setToken(null);
    setUser(null);
    localStorage.removeItem(`${STORAGE_PREFIX}token`);
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const resetPassword = async (email: string, newPass: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: newPass })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Password reset request failed' };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: true, message: 'Password reset simulation successful.' };
    }
  };

  // Subjects Handlers
  const addSubject = (sub: Omit<Subject, 'id' | 'studyHoursLogged'>) => {
    const newSubject: Subject = {
      ...sub,
      id: 'sub_' + Date.now(),
      studyHoursLogged: 0
    };
    setSubjects((prev) => [newSubject, ...prev]);
    addNotification({
      title: 'Subject Added',
      message: `${newSubject.name} has been added to your curriculum.`,
      type: 'system',
      linkTab: 'subjects'
    });
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSyllabusTopic = (subjectId: string, topicId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          syllabus: s.syllabus.map((top) =>
            top.id === topicId ? { ...top, completed: !top.completed } : top
          )
        };
      })
    );
  };

  const addSyllabusTopic = (subjectId: string, title: string) => {
    if (!title.trim()) return;
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const newTopic = { id: 'top_' + Date.now(), title: title.trim(), completed: false };
        return { ...s, syllabus: [...s.syllabus, newTopic] };
      })
    );
  };

  const deleteSyllabusTopic = (subjectId: string, topicId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return { ...s, syllabus: s.syllabus.filter((t) => t.id !== topicId) };
      })
    );
  };

  // Assignments Handlers
  const addAssignment = (asg: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAsg: Assignment = {
      ...asg,
      id: 'asg_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setAssignments((prev) => [newAsg, ...prev]);
    addNotification({
      title: 'New Assignment Added',
      message: `${newAsg.title} (${newAsg.subjectName}) due on ${newAsg.dueDate}.`,
      type: 'assignment',
      linkTab: 'assignments'
    });
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleAssignmentStatus = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const nextStatus: AssignmentStatus =
          a.status === 'Completed' ? 'Pending' : 'Completed';
        return { ...a, status: nextStatus };
      })
    );
  };

  // Exams Handlers
  const addExam = (exam: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...exam,
      id: 'exam_' + Date.now()
    };
    setExams((prev) => [...prev, newExam].sort((a, b) => a.date.localeCompare(b.date)));
    addNotification({
      title: 'Exam Scheduled 📌',
      message: `${newExam.name} on ${newExam.date} at ${newExam.time}.`,
      type: 'exam',
      linkTab: 'exams'
    });
  };

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setExams((prev) =>
      prev
        .map((e) => (e.id === id ? { ...e, ...updates } : e))
        .sort((a, b) => a.date.localeCompare(b.date))
    );
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExamRevisionStatus = (id: string, status: RevisionStatus) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, revisionStatus: status } : e)));
  };

  // Timetable Handlers
  const toggleSlotCompleted = (id: string) => {
    setTimetable((prev) =>
      prev.map((slot) => {
        if (slot.id !== id) return slot;
        const next = !slot.completed;
        if (next) {
          // Increment study hours for subject
          setSubjects((subs) =>
            subs.map((s) =>
              s.name === slot.subject ? { ...s, studyHoursLogged: Number((s.studyHoursLogged + 0.75).toFixed(1)) } : s
            )
          );
        }
        return { ...slot, completed: next };
      })
    );
  };

  const updateTimetableSlot = (id: string, updates: Partial<TimetableSlot>) => {
    setTimetable((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetable((prev) => prev.filter((s) => s.id !== id));
  };

  const addTimetableSlot = (slot: Omit<TimetableSlot, 'id'>) => {
    const newSlot: TimetableSlot = {
      ...slot,
      id: 'slot_' + Date.now()
    };
    setTimetable((prev) => [...prev, newSlot]);
  };

  // Pomodoro
  const logPomodoroSession = (session: Omit<PomodoroSession, 'id' | 'timestamp'>) => {
    const newSession: PomodoroSession = {
      ...session,
      id: 'pomo_' + Date.now(),
      timestamp: new Date().toISOString()
    };
    setPomodoroHistory((prev) => [newSession, ...prev]);

    // Also credit to subject study hours if matched
    if (session.subjectName) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.name === session.subjectName
            ? { ...s, studyHoursLogged: Number((s.studyHoursLogged + session.durationMinutes / 60).toFixed(1)) }
            : s
        )
      );
    }
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif_' + Date.now(),
      timestamp: 'Just now',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const resetToSampleData = () => {
    setUser(initialProfile);
    setSubjects(initialSubjects);
    setAssignments(initialAssignments);
    setExams(initialExams);
    setTimetable(initialTimetable);
    setPomodoroHistory(initialPomodoroHistory);
    setNotifications(initialNotifications);
    setToken('demo-token');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateProfile,
        resetPassword,
        activeTab,
        setActiveTab,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        toggleSyllabusTopic,
        addSyllabusTopic,
        deleteSyllabusTopic,
        assignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        toggleAssignmentStatus,
        exams,
        addExam,
        updateExam,
        deleteExam,
        updateExamRevisionStatus,
        timetable,
        setTimetable,
        toggleSlotCompleted,
        updateTimetableSlot,
        deleteTimetableSlot,
        addTimetableSlot,
        pomodoroHistory,
        logPomodoroSession,
        activeFocusTarget,
        setActiveFocusTarget,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        addNotification,
        resetToSampleData,
        aiStatus,
        isSyncing
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
