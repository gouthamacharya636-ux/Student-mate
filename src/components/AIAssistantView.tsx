import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  GraduationCap,
  RotateCcw,
  User,
  ArrowRight,
  Brain,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import { soundManager } from '../utils/audio';

const QUICK_PROMPTS = [
  'How do I master Data Structures & Algorithms in 3 weeks?',
  'Create a 5-day cram schedule for my upcoming exam',
  'How to overcome procrastination when studying complex engineering math?',
  'Explain the Feynman Technique for understanding difficult engineering concepts',
  'Review my upcoming deadlines and suggest today\'s top 3 study priorities'
];

export const AIAssistantView: React.FC = () => {
  const { user, subjects, exams, assignments, aiStatus } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg_initial',
        sender: 'assistant',
        text: `### 👋 Hi ${user?.name || 'Engineer'}! I'm StudyMate AI Assistant.

I am your personal engineering study companion. I have reviewed your current semester profile:
- **Major:** ${user?.major || 'Computer Science & Engineering'}
- **Current Courses:** ${subjects.map((s) => s.code || s.name).join(', ')}
- **Next High-Yield Exam:** ${exams[0]?.name || 'Course Midterms'}

How can I help you today? You can choose one of the quick prompts below or ask me any question about your curriculum, exam revision, or study routine!`,
        timestamp: 'Just now',
        model: aiStatus.provider
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    soundManager.playTick();

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            studentName: user?.name,
            major: user?.major,
            dailyGoal: user?.dailyStudyGoal,
            subjects,
            exams,
            assignments
          },
          chatHistory: messages.slice(-4)
        })
      });

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        text: data.reply || 'I am ready to help you optimize your studies.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        model: data.model || aiStatus.provider
      };

      setMessages((prev) => [...prev, assistantMessage]);
      soundManager.playChime();
    } catch (err) {
      console.warn('AI assistant chat request failed, generating fallback:', err);
      const fallbackMessage: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        text: `### 🎯 High-Impact Study Technique

When working through your engineering coursework, combine **Active Recall** with **Interleaved Practice**:
1. Spend 45 minutes on past paper questions without looking at hints.
2. If stuck, review the formula sheet or lecture slides for 10 minutes.
3. Test yourself again before moving on!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'offline-fallback',
        model: 'StudyMate Offline Tutor'
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg_reset',
        sender: 'assistant',
        text: `Conversation restarted. What engineering or academic topic would you like to tackle today?`,
        timestamp: 'Just now',
        model: aiStatus.provider
      }
    ]);
  };

  // Helper for rendering formatted markdown text (headings, bold, lists)
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Headings
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm sm:text-base font-black text-slate-900 mt-2.5 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base sm:text-lg font-black text-slate-900 mt-3 mb-1.5">
            {line.replace('## ', '')}
          </h3>
        );
      }
      // Blockquotes
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="my-2 border-l-3 border-indigo-500 bg-indigo-50/70 p-2.5 rounded-r-xl text-xs text-indigo-950 font-medium"
          >
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      // Bullets
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().substring(2);
        return (
          <li key={idx} className="text-xs leading-relaxed text-slate-700 ml-4 list-disc my-0.5">
            <span dangerouslySetInnerHTML={{ __html: parseBold(bulletText) }} />
          </li>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <p key={idx} className="text-xs leading-relaxed text-slate-700 my-1 font-medium">
            <span dangerouslySetInnerHTML={{ __html: parseBold(line) }} />
          </p>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Standard line
      return (
        <p
          key={idx}
          className="text-xs leading-relaxed text-slate-700 my-0.5"
          dangerouslySetInnerHTML={{ __html: parseBold(line) }}
        />
      );
    });
  };

  const parseBold = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8.5rem)] animate-in fade-in duration-300">
      {/* Left Chat Window (3 Cols) */}
      <div className="lg:col-span-3 flex flex-col rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">StudyMate AI Assistant</h3>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {aiStatus.hasApiKey ? 'Gemini 2.5 Active' : 'Offline Smart Tutor'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Context-aware for your {subjects.length} courses & {exams.length} scheduled exams
              </p>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            title="Restart conversation"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs text-xs font-bold mt-1">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}

                <div className="space-y-1 max-w-[88%]">
                  <div
                    className={`rounded-2xl p-4 sm:p-5 shadow-2xs ${
                      isUser
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-xs'
                        : 'bg-white border border-slate-200/90 text-slate-900 rounded-bl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    ) : (
                      <div>{renderFormattedMarkdown(msg.text)}</div>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <>
                        <span>•</span>
                        <span>{msg.model || 'StudyMate AI'}</span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-slate-600 ml-1"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs text-xs font-bold mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-xl">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs rounded-bl-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce"></span>
                  <span
                    className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                  <span
                    className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></span>
                  <span className="ml-2">Formulating optimal study response...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Quick Prompts:
          </span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-full bg-indigo-50/70 border border-indigo-100 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 border-t border-slate-100 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask StudyMate anything (e.g. create a 3-day exam review, debug a schedule clash)..."
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 transition-all cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Right Column: AI Live Context Drawer (1 Col) */}
      <div className="hidden lg:flex flex-col gap-4">
        {/* Course Context Card */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
            <Brain className="h-4 w-4" />
            <span>AI Knowledge Context</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            StudyMate automatically grounds responses on your enrolled engineering courses and deadlines.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
              Active Courses
            </span>
            {subjects.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate mr-2">{s.name}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  {s.difficulty}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
              Impending Deadlines
            </span>
            {assignments.filter(a => a.status !== 'Completed').slice(0, 2).map((a) => (
              <div key={a.id} className="text-xs">
                <p className="font-semibold text-slate-800 truncate">{a.title}</p>
                <p className="text-[10px] text-amber-600 font-medium">Due {a.dueDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Study Strategy Tip */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-5 border border-indigo-100 space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
            <Lightbulb className="h-4 w-4" />
            <span>Productivity Advice</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Need to memorize formulas? Ask the assistant: <em>"Generate a 10-question flashcard quiz for {subjects[0]?.name || 'Operating Systems'}."</em>
          </p>
        </div>
      </div>
    </div>
  );
};
