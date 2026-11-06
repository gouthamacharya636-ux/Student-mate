import { StudentProfile, Subject, Assignment, Exam, TimetableSlot, PomodoroSession, AppNotification } from '../types';

export const initialProfile: StudentProfile = {
  id: 'usr_demo_1',
  name: 'Alex Rivera',
  email: 'alex.rivera@techuni.edu',
  college: 'Apex Institute of Technology',
  major: 'Computer Science & Engineering',
  semester: '5th Semester',
  dailyStudyGoal: 4.5,
  avatarColor: 'from-purple-600 to-indigo-600',
  createdAt: '2026-09-01T08:00:00.000Z'
};

export const initialSubjects: Subject[] = [
  {
    id: 'sub_1',
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    instructor: 'Dr. Aris Vance',
    credits: 4,
    color: '#8b5cf6', // Purple
    difficulty: 'Hard',
    studyHoursLogged: 28.5,
    syllabus: [
      { id: 'syl_1_1', title: 'Asymptotic Analysis & Big-O Notation', completed: true },
      { id: 'syl_1_2', title: 'Binary Search Trees & AVL Trees', completed: true },
      { id: 'syl_1_3', title: 'Graph Traversal (BFS, DFS, Dijkstra)', completed: true },
      { id: 'syl_1_4', title: 'Dynamic Programming & Memoization', completed: false },
      { id: 'syl_1_5', title: 'Disjoint Set Union & Minimum Spanning Trees', completed: false },
      { id: 'syl_1_6', title: 'NP-Completeness & Approximation', completed: false }
    ]
  },
  {
    id: 'sub_2',
    name: 'Operating Systems',
    code: 'CS302',
    instructor: 'Prof. Elena Rostova',
    credits: 4,
    color: '#3b82f6', // Blue
    difficulty: 'Hard',
    studyHoursLogged: 22.0,
    syllabus: [
      { id: 'syl_2_1', title: 'Processes, Threads & Concurrency', completed: true },
      { id: 'syl_2_2', title: 'CPU Scheduling Algorithms', completed: true },
      { id: 'syl_2_3', title: 'Synchronization: Semaphores & Mutex', completed: true },
      { id: 'syl_2_4', title: 'Deadlock Detection & Prevention', completed: false },
      { id: 'syl_2_5', title: 'Virtual Memory & Page Replacement', completed: false },
      { id: 'syl_2_6', title: 'File System Implementation', completed: false }
    ]
  },
  {
    id: 'sub_3',
    name: 'Database Management Systems',
    code: 'CS303',
    instructor: 'Dr. Marcus Chen',
    credits: 3,
    color: '#06b6d4', // Cyan
    difficulty: 'Medium',
    studyHoursLogged: 16.5,
    syllabus: [
      { id: 'syl_3_1', title: 'Relational Algebra & SQL Queries', completed: true },
      { id: 'syl_3_2', title: 'ER Modeling & Relational Schema', completed: true },
      { id: 'syl_3_3', title: 'Normalization (1NF to BCNF)', completed: true },
      { id: 'syl_3_4', title: 'Transactions, ACID & Concurrency Control', completed: false },
      { id: 'syl_3_5', title: 'Indexing, B+ Trees & Query Optimization', completed: false }
    ]
  },
  {
    id: 'sub_4',
    name: 'Computer Networks',
    code: 'CS304',
    instructor: 'Prof. Sarah Jenkins',
    credits: 3,
    color: '#10b981', // Emerald
    difficulty: 'Medium',
    studyHoursLogged: 14.0,
    syllabus: [
      { id: 'syl_4_1', title: 'OSI & TCP/IP Layer Architecture', completed: true },
      { id: 'syl_4_2', title: 'Data Link Layer & Error Correction', completed: true },
      { id: 'syl_4_3', title: 'Routing Protocols (OSPF, BGP)', completed: false },
      { id: 'syl_4_4', title: 'Transport Layer (TCP Handshake & Congestion)', completed: false },
      { id: 'syl_4_5', title: 'Network Security & Public Key Cryptography', completed: false }
    ]
  },
  {
    id: 'sub_5',
    name: 'Engineering Mathematics III',
    code: 'MATH301',
    instructor: 'Dr. Leonard King',
    credits: 4,
    color: '#ec4899', // Pink
    difficulty: 'Hard',
    studyHoursLogged: 24.0,
    syllabus: [
      { id: 'syl_5_1', title: 'Fourier Series & Harmonic Analysis', completed: true },
      { id: 'syl_5_2', title: 'Laplace Transforms & Differential Equations', completed: true },
      { id: 'syl_5_3', title: 'Complex Variables & Contour Integration', completed: false },
      { id: 'syl_5_4', title: 'Probability Distributions & Random Variables', completed: false }
    ]
  }
];

// Helper to get formatted relative date
export function getOffsetDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export const initialAssignments: Assignment[] = [
  {
    id: 'asg_1',
    title: 'Dijkstra & A* Pathfinding Benchmark Lab',
    subjectId: 'sub_1',
    subjectName: 'Data Structures & Algorithms',
    description: 'Implement A* search algorithm with Euclidean heuristic in C++/Java. Compare runtime with standard Dijkstra on graph with 100k nodes.',
    dueDate: getOffsetDateString(2),
    dueTime: '23:59',
    priority: 'High',
    status: 'In Progress',
    submissionLink: 'https://classroom.google.com',
    createdAt: '2026-11-01'
  },
  {
    id: 'asg_2',
    title: 'Process Synchronization: Dining Philosophers',
    subjectId: 'sub_2',
    subjectName: 'Operating Systems',
    description: 'Design a deadlock-free and starvation-free solution using POSIX semaphores and mutex locks. Include race condition test cases.',
    dueDate: getOffsetDateString(4),
    dueTime: '17:00',
    priority: 'High',
    status: 'Pending',
    createdAt: '2026-11-02'
  },
  {
    id: 'asg_3',
    title: 'E-Commerce Schema Design & BCNF Normalization',
    subjectId: 'sub_3',
    subjectName: 'Database Management Systems',
    description: 'Convert raw unnormalized sales data into Boyce-Codd Normal Form with functional dependency proofs.',
    dueDate: getOffsetDateString(6),
    dueTime: '23:59',
    priority: 'Medium',
    status: 'Pending',
    createdAt: '2026-11-03'
  },
  {
    id: 'asg_4',
    title: 'Packet Sniffing & TCP Congestion Analysis',
    subjectId: 'sub_4',
    subjectName: 'Computer Networks',
    description: 'Capture Wireshark pcap traces during slow start and fast retransmit phases. Provide throughput graphs.',
    dueDate: getOffsetDateString(9),
    dueTime: '18:00',
    priority: 'Low',
    status: 'Pending',
    createdAt: '2026-11-04'
  },
  {
    id: 'asg_5',
    title: 'Fourier Series Waveform Synthesis Assignment',
    subjectId: 'sub_5',
    subjectName: 'Engineering Mathematics III',
    description: 'Derive Fourier coefficients for square wave and triangle wave. Compute Gibbs phenomenon overshoot percentage.',
    dueDate: getOffsetDateString(-2),
    dueTime: '23:59',
    priority: 'Medium',
    status: 'Completed',
    createdAt: '2026-10-28'
  }
];

export const initialExams: Exam[] = [
  {
    id: 'exam_1',
    name: 'Mid-Semester Examination: Data Structures',
    subjectId: 'sub_1',
    subjectName: 'Data Structures & Algorithms',
    date: getOffsetDateString(5),
    time: '09:30',
    location: 'Exam Hall 3B, Tech Block',
    syllabusDetails: 'Units 1-3: Trees, Graph Algorithms, Dynamic Programming, Disjoint Sets, Amortized Analysis.',
    targetScore: '90+',
    revisionStatus: 'In Revision'
  },
  {
    id: 'exam_2',
    name: 'Operating Systems Midterm Test',
    subjectId: 'sub_2',
    subjectName: 'Operating Systems',
    date: getOffsetDateString(11),
    time: '14:00',
    location: 'Seminar Hall 1',
    syllabusDetails: 'Process scheduling, Thread sync, Classical IPC problems, Banker Algorithm for Deadlock.',
    targetScore: '85+',
    revisionStatus: 'Not Started'
  },
  {
    id: 'exam_3',
    name: 'DBMS Midterm Theory & SQL Practical',
    subjectId: 'sub_3',
    subjectName: 'Database Management Systems',
    date: getOffsetDateString(17),
    time: '11:00',
    location: 'Computing Lab 4',
    syllabusDetails: 'Relational algebra, complex nested subqueries, normalization proofs, transaction isolation levels.',
    targetScore: '92+',
    revisionStatus: 'Not Started'
  }
];

export const initialTimetable: TimetableSlot[] = [
  {
    id: 'slot_1',
    day: 'Monday',
    startTime: '17:00',
    endTime: '17:50',
    subject: 'Data Structures & Algorithms',
    code: 'CS301',
    topic: 'Graph BFS & Dijkstra Shortest Path Proofs',
    type: 'Study',
    priority: 'High',
    completed: true
  },
  {
    id: 'slot_2',
    day: 'Monday',
    startTime: '18:05',
    endTime: '18:55',
    subject: 'Operating Systems',
    code: 'CS302',
    topic: 'Producer-Consumer Semaphore Implementation',
    type: 'Assignment',
    priority: 'High',
    completed: true
  },
  {
    id: 'slot_3',
    day: 'Monday',
    startTime: '19:10',
    endTime: '20:00',
    subject: 'Engineering Mathematics III',
    code: 'MATH301',
    topic: 'Complex Residue Theorem & Contour Integrals',
    type: 'Study',
    priority: 'Medium',
    completed: false
  },
  {
    id: 'slot_4',
    day: 'Tuesday',
    startTime: '17:00',
    endTime: '17:50',
    subject: 'Data Structures & Algorithms',
    code: 'CS301',
    topic: 'Dynamic Programming: 0/1 Knapsack & LCS',
    type: 'Revision',
    priority: 'High',
    completed: true
  },
  {
    id: 'slot_5',
    day: 'Tuesday',
    startTime: '18:05',
    endTime: '18:55',
    subject: 'Database Management Systems',
    code: 'CS303',
    topic: 'Functional Dependency Closure & BCNF',
    type: 'Study',
    priority: 'Medium',
    completed: false
  },
  {
    id: 'slot_6',
    day: 'Wednesday',
    startTime: '17:00',
    endTime: '17:50',
    subject: 'Data Structures & Algorithms',
    code: 'CS301',
    topic: 'Past Midterm Paper (2024 & 2025 Solved Sets)',
    type: 'Revision',
    priority: 'High',
    completed: false
  },
  {
    id: 'slot_7',
    day: 'Wednesday',
    startTime: '18:05',
    endTime: '18:55',
    subject: 'Computer Networks',
    code: 'CS304',
    topic: 'Subnetting, CIDR & Distance Vector Routing',
    type: 'Study',
    priority: 'Medium',
    completed: false
  },
  {
    id: 'slot_8',
    day: 'Thursday',
    startTime: '17:00',
    endTime: '17:50',
    subject: 'Operating Systems',
    code: 'CS302',
    topic: 'Banker Algorithm & Deadlock Avoidance',
    type: 'Revision',
    priority: 'High',
    completed: false
  },
  {
    id: 'slot_9',
    day: 'Thursday',
    startTime: '18:05',
    endTime: '18:55',
    subject: 'Data Structures & Algorithms',
    code: 'CS301',
    topic: 'A* Pathfinding Algorithm Code Verification',
    type: 'Assignment',
    priority: 'High',
    completed: false
  },
  {
    id: 'slot_10',
    day: 'Friday',
    startTime: '16:30',
    endTime: '17:30',
    subject: 'Engineering Mathematics III',
    code: 'MATH301',
    topic: 'Laplace Differential Equations Review',
    type: 'Study',
    priority: 'Medium',
    completed: false
  },
  {
    id: 'slot_11',
    day: 'Friday',
    startTime: '17:45',
    endTime: '18:45',
    subject: 'Database Management Systems',
    code: 'CS303',
    topic: 'Indexing & B+ Tree Search Queries',
    type: 'Study',
    priority: 'Medium',
    completed: false
  },
  {
    id: 'slot_12',
    day: 'Saturday',
    startTime: '10:00',
    endTime: '11:15',
    subject: 'Data Structures & Algorithms',
    code: 'CS301',
    topic: 'Full Mock Exam Simulation (timed 75 mins)',
    type: 'Revision',
    priority: 'High',
    completed: false
  },
  {
    id: 'slot_13',
    day: 'Sunday',
    startTime: '16:00',
    endTime: '17:15',
    subject: 'Operating Systems',
    code: 'CS302',
    topic: 'Weekly Catchup & Buffer Session',
    type: 'Revision',
    priority: 'Medium',
    completed: false
  }
];

export const initialPomodoroHistory: PomodoroSession[] = [
  {
    id: 'pomo_1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    subjectName: 'Data Structures & Algorithms',
    taskName: 'Dijkstra Priority Queue Code',
    durationMinutes: 25,
    mode: 'pomodoro'
  },
  {
    id: 'pomo_2',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    subjectName: 'Data Structures & Algorithms',
    taskName: 'AVL Tree Rotations',
    durationMinutes: 25,
    mode: 'pomodoro'
  },
  {
    id: 'pomo_3',
    timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
    subjectName: 'Operating Systems',
    taskName: 'Semaphore Locks Practice',
    durationMinutes: 25,
    mode: 'pomodoro'
  },
  {
    id: 'pomo_4',
    timestamp: new Date(Date.now() - 3600000 * 50).toISOString(),
    subjectName: 'Engineering Mathematics III',
    taskName: 'Fourier Coefficients',
    durationMinutes: 25,
    mode: 'pomodoro'
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif_1',
    title: 'Upcoming Examination Alert',
    message: 'Data Structures & Algorithms Midterm Exam is in 5 days! Revision recommended.',
    type: 'exam',
    timestamp: '1 hour ago',
    read: false,
    linkTab: 'exams'
  },
  {
    id: 'notif_2',
    title: 'Assignment Deadline Approaching',
    message: 'Dijkstra & A* Pathfinding Benchmark is due in 2 days.',
    type: 'assignment',
    timestamp: '3 hours ago',
    read: false,
    linkTab: 'assignments'
  },
  {
    id: 'notif_3',
    title: 'Study Session Reminder',
    message: 'Today\'s 5:00 PM session: Graph BFS & Shortest Path Proofs scheduled.',
    type: 'schedule',
    timestamp: '5 hours ago',
    read: true,
    linkTab: 'planner'
  }
];
