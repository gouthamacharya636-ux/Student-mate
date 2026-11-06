export type Priority = 'High' | 'Medium' | 'Low';
export type AssignmentStatus = 'Pending' | 'In Progress' | 'Completed';
export type RevisionStatus = 'Not Started' | 'In Revision' | 'Ready' | 'Completed';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface SyllabusTopic {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  instructor?: string;
  credits: number;
  color: string; // Tailwind color token or hex
  difficulty: Difficulty;
  syllabus: SyllabusTopic[];
  studyHoursLogged: number;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  status: AssignmentStatus;
  submissionLink?: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location?: string;
  syllabusDetails?: string;
  targetScore?: string;
  revisionStatus: RevisionStatus;
}

export interface TimetableSlot {
  id: string;
  day: string; // 'Monday', 'Tuesday', etc.
  startTime: string; // '17:00'
  endTime: string; // '17:45'
  subject: string;
  code?: string;
  topic: string;
  type: 'Study' | 'Revision' | 'Assignment' | 'Lab';
  priority: Priority;
  completed: boolean;
}

export interface PomodoroSession {
  id: string;
  timestamp: string;
  subjectId?: string;
  subjectName?: string;
  taskName?: string;
  durationMinutes: number;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  model?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'exam' | 'assignment' | 'schedule' | 'system';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  college: string;
  major: string;
  semester: string;
  dailyStudyGoal: number; // hours
  avatarColor: string;
  createdAt: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'subjects'
  | 'assignments'
  | 'exams'
  | 'planner'
  | 'assistant'
  | 'pomodoro'
  | 'analytics'
  | 'settings';
