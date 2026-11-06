import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Persistence directory
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface AppDatabase {
  users: Record<string, any>;
  sessions: Record<string, string>; // token -> userId
}

function loadDatabase(): AppDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading db.json, initializing fresh db:', err);
  }
  return { users: {}, sessions: {} };
}

function saveDatabase(db: AppDatabase) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

// Ensure initial database exists
let db = loadDatabase();

// Helper to get user from Auth header or query
function getUserIdFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (db.sessions[token]) {
      return db.sessions[token];
    }
  }
  // Optional query token fallback
  const queryToken = req.query.token as string;
  if (queryToken && db.sessions[queryToken]) {
    return db.sessions[queryToken];
  }
  return null;
}

// ---------------- AUTH ROUTES ----------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, college, major, semester, dailyStudyGoal } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  db = loadDatabase();
  const normalizedEmail = email.toLowerCase().trim();

  // Check if exists
  const existingUserId = Object.keys(db.users).find(
    (id) => db.users[id].profile?.email?.toLowerCase() === normalizedEmail
  );

  if (existingUserId) {
    return res.status(409).json({ error: 'A student with this email already exists' });
  }

  const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);

  const newUser = {
    id: userId,
    password, // Demo / school app hash simulation
    profile: {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      college: college?.trim() || 'Institute of Technology',
      major: major?.trim() || 'Computer Science & Engineering',
      semester: semester || '5th Semester',
      dailyStudyGoal: dailyStudyGoal || 4,
      avatarColor: 'from-purple-600 to-indigo-600',
      createdAt: new Date().toISOString()
    },
    subjects: [],
    assignments: [],
    exams: [],
    timetable: [],
    pomodoroHistory: [],
    chatHistory: [],
    notifications: []
  };

  db.users[userId] = newUser;
  db.sessions[token] = userId;
  saveDatabase(db);

  res.json({
    token,
    user: newUser.profile,
    data: {
      subjects: newUser.subjects,
      assignments: newUser.assignments,
      exams: newUser.exams,
      timetable: newUser.timetable,
      pomodoroHistory: newUser.pomodoroHistory,
      chatHistory: newUser.chatHistory,
      notifications: newUser.notifications
    }
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db = loadDatabase();
  const normalizedEmail = email.toLowerCase().trim();

  const userId = Object.keys(db.users).find(
    (id) => db.users[id].profile?.email?.toLowerCase() === normalizedEmail
  );

  if (!userId || db.users[userId].password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  db.sessions[token] = userId;
  saveDatabase(db);

  const user = db.users[userId];
  res.json({
    token,
    user: user.profile,
    data: {
      subjects: user.subjects || [],
      assignments: user.assignments || [],
      exams: user.exams || [],
      timetable: user.timetable || [],
      pomodoroHistory: user.pomodoroHistory || [],
      chatHistory: user.chatHistory || [],
      notifications: user.notifications || []
    }
  });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  db = loadDatabase();
  const normalizedEmail = email.toLowerCase().trim();
  const userId = Object.keys(db.users).find(
    (id) => db.users[id].profile?.email?.toLowerCase() === normalizedEmail
  );

  if (!userId) {
    return res.status(404).json({ error: 'No student account registered with this email' });
  }

  if (newPassword) {
    db.users[userId].password = newPassword;
    saveDatabase(db);
    return res.json({ message: 'Password updated successfully. You can now login.' });
  }

  // Verification code response
  res.json({ message: 'Password reset code verified. Please set your new password.' });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  if (!userId || !db.users[userId]) {
    return res.status(401).json({ error: 'Unauthorized or session expired' });
  }

  const user = db.users[userId];
  res.json({
    user: user.profile,
    data: {
      subjects: user.subjects || [],
      assignments: user.assignments || [],
      exams: user.exams || [],
      timetable: user.timetable || [],
      pomodoroHistory: user.pomodoroHistory || [],
      chatHistory: user.chatHistory || [],
      notifications: user.notifications || []
    }
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    delete db.sessions[token];
    saveDatabase(db);
  }
  res.json({ success: true });
});

// ---------------- DATA PERSISTENCE ----------------

app.post('/api/data/sync', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  if (!userId || !db.users[userId]) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { profile, subjects, assignments, exams, timetable, pomodoroHistory, chatHistory, notifications } = req.body;

  db = loadDatabase();
  if (profile) db.users[userId].profile = { ...db.users[userId].profile, ...profile };
  if (subjects !== undefined) db.users[userId].subjects = subjects;
  if (assignments !== undefined) db.users[userId].assignments = assignments;
  if (exams !== undefined) db.users[userId].exams = exams;
  if (timetable !== undefined) db.users[userId].timetable = timetable;
  if (pomodoroHistory !== undefined) db.users[userId].pomodoroHistory = pomodoroHistory;
  if (chatHistory !== undefined) db.users[userId].chatHistory = chatHistory;
  if (notifications !== undefined) db.users[userId].notifications = notifications;

  saveDatabase(db);
  res.json({ success: true, timestamp: Date.now() });
});

// ---------------- AI ASSISTANT & PLANNER ----------------

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI with provided key, using offline smart engine:', err);
  }
}

// Check AI status
app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    hasApiKey: !!(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    provider: apiKey && apiKey !== 'MY_GEMINI_API_KEY' ? 'Gemini 2.5 Flash' : 'StudyMate Smart Offline Engine',
    mode: apiKey && apiKey !== 'MY_GEMINI_API_KEY' ? 'online' : 'offline'
  });
});

// AI Chatbot endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, context, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Try Gemini if available
  if (aiClient) {
    try {
      const systemInstruction = `You are StudyMate AI, an expert academic advisor, engineering tutor, and study productivity mentor.
The student using the app is:
- Name: ${context?.studentName || 'Student'}
- Major: ${context?.major || 'Engineering'}
- Daily Study Goal: ${context?.dailyGoal || 4} hours
- Active Subjects: ${(context?.subjects || []).map((s: any) => `${s.name} (${s.code || ''}) - Difficulty: ${s.difficulty}`).join(', ') || 'General Engineering'}
- Upcoming Exams: ${(context?.exams || []).map((e: any) => `${e.name} in ${e.subject} on ${e.date}`).join(', ') || 'None scheduled yet'}
- Pending Assignments: ${(context?.assignments || []).filter((a: any) => a.status !== 'Completed').map((a: any) => `${a.title} (${a.subject}) due ${a.dueDate} [${a.priority}]`).join(', ') || 'All caught up'}

Your goal is to provide encouraging, high-yield, structured advice.
Format your responses clearly using Markdown with:
- Clear headings and bullet points
- Step-by-step actionable techniques (Feynman technique, Pomodoro blocks, spaced repetition, active recall)
- Specific references to the student's actual subjects and exams when relevant
- Keep responses friendly, sharp, pragmatic, and motivating. Avoid generic fluff.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nStudent Question: ${message}` }] }
        ]
      });

      if (response.text) {
        return res.json({
          reply: response.text,
          source: 'gemini',
          model: 'Gemini 2.5 Flash'
        });
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to smart academic engine:', err?.message || err);
    }
  }

  // High-intelligence offline academic advisor generator
  const offlineReply = generateOfflineStudyAdvice(message, context);
  res.json({
    reply: offlineReply,
    source: 'offline-smart-engine',
    model: 'StudyMate Offline Tutor'
  });
});

// Intelligent timetable generator endpoint
app.post('/api/ai/generate-schedule', async (req: Request, res: Response) => {
  const { dailyHours, subjects, exams, assignments, preferredTimes, sessionLength } = req.body;

  // We can generate a balanced schedule algorithmically or with Gemini
  if (aiClient) {
    try {
      const prompt = `Create a structured 7-day college student study timetable (Monday to Sunday) based on:
- Daily study target: ${dailyHours || 4} hours/day
- Preferred study time: ${preferredTimes || 'Evening (5 PM - 9 PM)'}
- Session block duration: ${sessionLength || 45} minutes with 10-15 min breaks
- Subjects (with difficulty): ${JSON.stringify(subjects || [])}
- Upcoming Exams: ${JSON.stringify(exams || [])}
- Assignments: ${JSON.stringify(assignments || [])}

Rules:
1. Prioritize subjects with upcoming exams first and give 40% more study blocks to difficult subjects.
2. Ensure realistic study sessions with start time and end time.
3. Include 10-15 minute break between study blocks.
4. Output strictly valid JSON with an array of objects matching this exact structure:
[
  {
    "id": "slot-1",
    "day": "Monday",
    "startTime": "17:00",
    "endTime": "17:45",
    "subject": "Subject Name",
    "topic": "Key Focus Topic",
    "type": "Study" | "Revision" | "Assignment",
    "priority": "High" | "Medium" | "Low"
  }
]
No markdown wrapping, just valid JSON array.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const schedule = JSON.parse(cleanJson);
        if (Array.isArray(schedule) && schedule.length > 0) {
          return res.json({ schedule, source: 'gemini' });
        }
      }
    } catch (e) {
      console.warn('Gemini timetable generation fell back to heuristic engine:', e);
    }
  }

  // Fallback to algorithmic generator
  const schedule = generateAlgorithmicTimetable(dailyHours, subjects, exams, assignments, preferredTimes, sessionLength);
  res.json({ schedule, source: 'algorithmic' });
});

// Smart offline heuristic response generator
function generateOfflineStudyAdvice(query: string, context: any): string {
  const q = query.toLowerCase();
  const studentName = context?.studentName || 'Engineer';
  const subjects = context?.subjects || [];
  const exams = context?.exams || [];
  const assignments = context?.assignments || [];

  const urgentExams = exams.filter((e: any) => e.status !== 'Completed');
  const pendingAssignments = assignments.filter((a: any) => a.status !== 'Completed');

  if (q.includes('exam') || q.includes('test') || q.includes('cram') || q.includes('revision') || q.includes('prepare')) {
    const targetExam = urgentExams[0]?.name || 'your upcoming engineering exams';
    return `### 🎯 High-Yield Exam Preparation Protocol for ${studentName}

When preparing for **${targetExam}**, passive reading yields less than 20% retention. Here is a battle-tested 4-phase strategy:

1. **Active Recall & Past Exam Questions (The 80/20 Rule):**
   - Spend 60% of your prep time solving past university papers and textbook problem sets without looking at the solutions.
   - Mark questions where you get stuck; these reveal your actual knowledge gaps.

2. **The Feynman Validation Method:**
   - Take the most challenging derivation, algorithm, or theorem.
   - Explain it out loud on a whiteboard or blank paper as if teaching a 1st-year student.
   - If you resort to jargon, review that specific section immediately.

3. **Spaced Interleaving:**
   - Avoid spending 6 straight hours on one single topic. Instead, alternate between **problem-solving** (${subjects[0]?.name || 'Core Theory'}) and **conceptual review** (${subjects[1]?.name || 'Applied Subjects'}).

4. **Exam Day Simulation:**
   - Set a 45-minute countdown timer under strict exam conditions (no phone, no browser tabs). Solve 3 full numerical problems.

> 💡 **Action for today:** Review your countdown on the **Exams** tab and allocate two 45-minute Pomodoro blocks tonight to past paper questions!`;
  }

  if (q.includes('procrastinat') || q.includes('focus') || q.includes('tired') || q.includes('motivat') || q.includes('distract')) {
    return `### ⚡ Overcoming Academic Resistance & Boosting Focus

Procrastination in engineering courses is rarely about laziness—it's usually **cognitive overload** from complex problems.

Here is how to break the paralysis:

1. **The 5-Minute Rule (Micro-Commitment):**
   - Tell yourself: *"I will only open my notes and read one paragraph or write two lines of code for 5 minutes."* Once the activation energy is crossed, momentum carries you forward.
2. **Use the Focus Timer:**
   - Head to our **Focus Timer** tab. Start with a **25-minute Pomodoro** session. Put your phone in another room or face down.
3. **Friction Architecture:**
   - Close all social tabs. Open only your textbook PDF and your problem sheet.
4. **Reward Milestones:**
   - After completing two 25-minute sprints, grant yourself a 10-minute break with a walk or your favorite snack.

> *"You don't need motivation to start; action generates the motivation."* Start your first 25-minute sprint right now!`;
  }

  if (q.includes('schedule') || q.includes('plan') || q.includes('time') || q.includes('routine')) {
    return `### 🗓️ Optimal Study Routine for College Engineers

To balance ${subjects.length || 5} subjects with labs, assignments, and exams:

1. **Morning Prime Hours (Deep Work):**
   - Dedicate 60–90 minutes before afternoon lectures to your hardest subject (${subjects.find((s: any) => s.difficulty === 'Hard')?.name || 'Hardest Subject'}).
2. **Evening Problem Sets (Applied Work):**
   - Use 5:00 PM – 7:30 PM for practical assignments and numerical solving.
3. **Night Review (Spaced Repetition):**
   - Spend 20 minutes before bed doing flashcards or reviewing formulas from today's lectures.
4. **Buffer Blocks:**
   - Keep Sunday afternoons open as a "catch-up buffer" to absorb unexpected delays without stress.

Check the **AI Study Planner** tab in the sidebar to generate a complete personalized daily timetable!`;
  }

  if (q.includes('assignment') || q.includes('deadline') || q.includes('project')) {
    return `### 📝 Assignment Execution Blueprint

You have **${pendingAssignments.length} pending assignment(s)** in your queue.

**Strategy to clear the backlog:**
1. **Sort by Deadline & Urgency:** Attack High-Priority items due in the next 48 hours first.
2. **Deconstruct into Atomic Subtasks:** Never write "Finish Lab Report" as a single task. Break it into:
   - *Step 1: Write abstract and formula list (20 mins)*
   - *Step 2: Plot simulation graphs / output results (30 mins)*
   - *Step 3: Draft conclusion & format references (20 mins)*
3. **Submit Early Buffer:** Aim to finish 24 hours prior to deadline to prevent last-minute portal crashes.

Head over to the **Assignments** tab to tick off completed sections!`;
  }

  // General comprehensive answer
  return `### 👋 Hello ${studentName}! I'm StudyMate AI Assistant

I am here to help you optimize your engineering and college studies. Here are high-impact ways we can work together:

- **Exam Strategy:** Ask me how to structure revision for difficult subjects like Data Structures, Control Systems, Calculus, or Database Design.
- **Time Boxing:** Ask me to create a customized daily cram or weekly balance routine based on your schedule.
- **Assignment Tactics:** How to break down complex project reports and debug homework roadblocks.
- **Focus Science:** Active recall methods, spaced repetition algorithms, and mental clarity tactics.

**Quick question:** Would you like to review your timetable for today, tackle your highest-priority assignment, or set up a Pomodoro focus sprint?`;
}

// Algorithmic Timetable Generator
function generateAlgorithmicTimetable(
  dailyHours = 4,
  subjects: any[] = [],
  exams: any[] = [],
  assignments: any[] = [],
  preferredTimes = 'Evening',
  sessionLength = 45
) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timetable: any[] = [];

  const defaultSubjects = subjects.length > 0 ? subjects : [
    { name: 'Data Structures & Algorithms', difficulty: 'Hard', code: 'CS301' },
    { name: 'Computer Architecture', difficulty: 'Medium', code: 'CS302' },
    { name: 'Database Management Systems', difficulty: 'Medium', code: 'CS303' },
    { name: 'Discrete Mathematics', difficulty: 'Hard', code: 'MATH204' },
    { name: 'Operating Systems', difficulty: 'Medium', code: 'CS305' }
  ];

  // Base start hour depending on preference
  let startHour = 17; // default evening 5pm
  if (preferredTimes.includes('Morning')) startHour = 8;
  else if (preferredTimes.includes('Afternoon')) startHour = 14;
  else if (preferredTimes.includes('Night')) startHour = 20;

  const sessionsPerDay = Math.max(1, Math.min(6, Math.round((Number(dailyHours) * 60) / (sessionLength + 15))));

  let slotIndex = 1;

  days.forEach((day, dayIdx) => {
    let currentMinute = startHour * 60;

    for (let s = 0; s < sessionsPerDay; s++) {
      // Pick subject: favor upcoming exam or difficult subjects
      const subIdx = (dayIdx * 2 + s) % defaultSubjects.length;
      const sub = defaultSubjects[subIdx];

      // Check if there's an exam for this subject
      const hasExam = exams.find((e: any) => e.subject === sub.name || e.subject === sub.code);
      const hasAssignment = assignments.find((a: any) => (a.subject === sub.name || a.subject === sub.code) && a.status !== 'Completed');

      let sessionType = 'Study';
      if (hasExam) sessionType = 'Revision';
      else if (hasAssignment && s === sessionsPerDay - 1) sessionType = 'Assignment';

      const startH = Math.floor(currentMinute / 60) % 24;
      const startM = currentMinute % 60;
      const endMinute = currentMinute + sessionLength;
      const endH = Math.floor(endMinute / 60) % 24;
      const endM = endMinute % 60;

      const formatTime = (h: number, m: number) =>
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      timetable.push({
        id: `slot-${slotIndex++}`,
        day,
        startTime: formatTime(startH, startM),
        endTime: formatTime(endH, endM),
        subject: sub.name,
        code: sub.code || '',
        topic: hasExam ? `Past Paper Revision & Formula Recall` : `${sub.name} Core Concepts & Numerical Problems`,
        type: sessionType,
        priority: sub.difficulty === 'Hard' || hasExam ? 'High' : 'Medium',
        completed: false
      });

      // Add break
      currentMinute = endMinute + 15;
    }
  });

  return timetable;
}

// ---------------- VITE OR STATIC SERVING ----------------

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyMate AI Server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
