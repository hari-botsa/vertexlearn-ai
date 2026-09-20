import React, { useState } from "react";
import { 
  LifeBuoy, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Calendar, 
  Clock, 
  BrainCircuit, 
  CheckCircle, 
  HelpCircle,
  Zap
} from "lucide-react";
import { SupportTicket, Course } from "../types";

interface SupportViewProps {
  courses: Course[];
  activeCourse?: Course | null;
}

export const SupportView: React.FC<SupportViewProps> = ({ courses, activeCourse }) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "academic_advising" | "study_planning" | "technical" | "prerequisites"
  >("academic_advising");

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "sup-init-1",
      category: "study_planning",
      sender: "support_ai",
      text: `Hello! I am your 24/7 VertexLearn AI Student Support Advisor. 

I can assist with:
• Constructing custom revision timetables & Pomodoro study schedules
• Diagnosing conceptual prerequisites before starting advanced modules
• Recommending cognitive retention routines (Active Recall & Spaced Repetition)
• Academic stress management and learning pace optimization

How can I help you succeed today?`,
      timestamp: "09:00 AM",
    },
  ]);

  const handleSendSupport = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    setInputQuery("");
    const userTicket: SupportTicket = {
      id: "tick-" + Date.now(),
      category: selectedCategory,
      sender: "student",
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setTickets((prev) => [...prev, userTicket]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/support/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q.trim(),
          category: selectedCategory,
          currentCourse: activeCourse?.title || "",
        }),
      });

      const data = await response.json();
      const aiTicket: SupportTicket = {
        id: "tick-ai-" + Date.now(),
        category: selectedCategory,
        sender: "support_ai",
        text: data.reply || "Our academic advisors have recorded your query.",
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setTickets((prev) => [...prev, aiTicket]);
    } catch (err) {
      console.error("Support desk error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const quickInquiries = [
    "Design a 5-day study timetable for 45 minutes daily",
    "What are the absolute prerequisites for Deep Learning Foundations?",
    "How can I apply Spaced Repetition to memorize algorithmic patterns?",
    "I have an assessment in 3 days. What is my highest-leverage study plan?",
  ];

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-100">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-slate-900 font-['Outfit',sans-serif]">
                  24/7 Real-Time Student Support Desk
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Instant Response
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Academic advising, personalized study schedules, cognitive strategies, and real-time guidance.
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {[
            { id: "academic_advising", label: "Academic Advising", icon: BrainCircuit },
            { id: "study_planning", label: "Study Planning", icon: Calendar },
            { id: "prerequisites", label: "Prerequisites", icon: CheckCircle },
            { id: "technical", label: "Workspace & Help", icon: HelpCircle },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[65vh] min-h-[420px] max-h-[640px] sm:h-[520px] overflow-hidden">
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {tickets.map((t) => {
            const isUser = t.sender === "student";

            return (
              <div
                key={t.id}
                className={`flex items-start space-x-2 sm:space-x-3 min-w-0 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs ${
                    isUser ? "bg-slate-800" : "bg-gradient-to-tr from-emerald-600 to-teal-600"
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className={`space-y-1 max-w-[85%] sm:max-w-2xl min-w-0 ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-3 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-['Plus_Jakarta_Sans',sans-serif] break-words overflow-hidden ${
                      isUser
                        ? "bg-emerald-700 text-white rounded-tr-none shadow-xs"
                        : "bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs"
                    }`}
                  >
                    {t.text}
                  </div>
                  <span className="text-[10px] text-slate-400 px-1">{t.timestamp}</span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 rounded-tl-none flex items-center space-x-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-emerald-700 font-medium">Synthesizing personalized guidance...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Suggested:</span>
          {quickInquiries.map((qi, idx) => (
            <button
              key={idx}
              onClick={() => handleSendSupport(qi)}
              className="text-[11px] px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-full transition-all cursor-pointer shrink-0"
            >
              {qi}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-end space-x-2">
            <textarea
              id="input-support-query"
              rows={2}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask our 24/7 Student Support Desk for study schedules, prerequisite checks, or learning strategy..."
              className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-['Plus_Jakarta_Sans',sans-serif]"
            />
            <button
              id="btn-send-support"
              disabled={!inputQuery.trim() || isLoading}
              onClick={() => handleSendSupport()}
              className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                inputQuery.trim() && !isLoading
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
