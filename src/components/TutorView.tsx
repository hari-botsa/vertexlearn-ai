import React, { useState, useRef, useEffect } from "react";
import { 
  Brain, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Lightbulb, 
  Code, 
  Compass, 
  BookOpen, 
  Volume2,
  VolumeX,
  X,
  MessageSquare
} from "lucide-react";
import { TutorMessage, TutorPersona, Lesson } from "../types";
import { SpeechNarrator } from "../utils/audioAndFx";

interface TutorViewProps {
  messages: TutorMessage[];
  userEmail?: string;
  userName?: string;
  onSendMessage: (text: string, persona: TutorPersona, contextLesson?: Lesson) => Promise<void>;
  onClearHistory: () => void;
  activeLesson?: Lesson | null;
  onClearActiveLessonContext: () => void;
  isLoading: boolean;
}

export const TutorView: React.FC<TutorViewProps> = ({
  messages,
  userEmail,
  userName,
  onSendMessage,
  onClearHistory,
  activeLesson,
  onClearActiveLessonContext,
  isLoading,
}) => {
  const [inputText, setInputText] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<TutorPersona>("socratic");
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    setInputText("");
    await onSendMessage(text.trim(), selectedPersona, activeLesson || undefined);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeakMessage = (id: string, text: string) => {
    if (speakingMessageId === id) {
      SpeechNarrator.stop();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(id);
      SpeechNarrator.speak(text, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  const personas = [
    {
      id: "socratic" as TutorPersona,
      name: "Socratic Guide",
      icon: Compass,
      desc: "Prompts with gentle questions to help you discover answers",
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
    {
      id: "deep" as TutorPersona,
      name: "Deep Academic",
      icon: BookOpen,
      desc: "Comprehensive, mathematically rigorous explanations",
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      id: "analogy" as TutorPersona,
      name: "Analogy Master",
      icon: Lightbulb,
      desc: "Explains tricky concepts with vivid everyday metaphors",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      id: "code_expert" as TutorPersona,
      name: "Code Specialist",
      icon: Code,
      desc: "Provides clean architecture, Big-O, and edge cases",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  const quickPrompts = [
    "Explain this using a simple real-world analogy",
    "What are common mistakes beginners make here?",
    "Give me a practical challenge to test my retention",
    "How is this implemented in production systems?",
  ];

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-4">
      {/* Tutor Header & Persona Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900 font-['Outfit',sans-serif]">
                  Intelligent AI Tutor
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Gemini Flash 3.8 Active
                </span>
                {userEmail && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1">
                    <User className="w-2.5 h-2.5" />
                    <span>Chat isolated to {userName || userEmail}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Personalized 1-on-1 tutoring tuned to your exact learning velocity and comprehension style.
              </p>
            </div>
          </div>

          <button
            id="btn-clear-tutor-history"
            onClick={onClearHistory}
            className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer self-start sm:self-center font-medium"
            title="Reset and wipe chat history for this account"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>Reset Chat</span>
          </button>
        </div>

        {/* Lesson Context Pill if attached */}
        {activeLesson && (
          <div className="flex items-center justify-between px-3 py-2 bg-indigo-50/80 border border-indigo-200 rounded-lg text-xs text-indigo-900">
            <div className="flex items-center space-x-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="font-semibold text-indigo-700">Context Loaded:</span>
              <span className="truncate font-medium">"{activeLesson.title}"</span>
            </div>
            <button
              onClick={onClearActiveLessonContext}
              className="text-indigo-400 hover:text-indigo-700 p-0.5 rounded transition-colors cursor-pointer ml-2"
              title="Remove lesson context"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Persona Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                id={`persona-btn-${p.id}`}
                onClick={() => setSelectedPersona(p.id)}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                  <span className="truncate">{p.name}</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[65vh] min-h-[440px] max-h-[640px] sm:h-[560px] overflow-hidden">
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-4 text-slate-500">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Brain className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  What would you like to master today?
                </h3>
                <p className="text-xs text-slate-500">
                  Ask any question from your curriculum, request a step-by-step problem breakdown, or try one of the starter prompts below:
                </p>
              </div>

              {/* Starter Prompt Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg pt-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-left p-2.5 sm:p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs text-slate-700 transition-all cursor-pointer flex items-start space-x-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2 sm:space-x-3 min-w-0 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs ${
                      isUser ? "bg-slate-800" : "bg-gradient-to-tr from-indigo-600 to-purple-600"
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`space-y-2 max-w-[85%] sm:max-w-2xl min-w-0 ${isUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`p-3 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed break-words overflow-hidden ${
                        isUser
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                          : "bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs"
                      }`}
                    >
                      {/* Context badge if present */}
                      {msg.contextLessonTitle && !isUser && (
                        <div className="text-[10px] font-semibold text-indigo-600 mb-2 pb-1.5 border-b border-slate-200 flex items-center space-x-1 truncate">
                          <BookOpen className="w-3 h-3 shrink-0" />
                          <span className="truncate">Discussing: {msg.contextLessonTitle}</span>
                        </div>
                      )}

                      {/* Message Content formatted */}
                      <div className="space-y-2 whitespace-pre-wrap font-['Plus_Jakarta_Sans',sans-serif] break-words">
                        {msg.content}
                      </div>

                      {/* Footer actions for assistant response */}
                      {!isUser && (
                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-200/70 text-slate-400 text-[10px] sm:text-[11px]">
                          <span>{msg.timestamp}</span>
                          <button
                            onClick={() => handleSpeakMessage(msg.id, msg.content)}
                            className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                              speakingMessageId === msg.id
                                ? "bg-amber-100 text-amber-700 font-bold"
                                : "hover:text-indigo-600 hover:bg-indigo-50 text-slate-500"
                            }`}
                            title="Read response aloud"
                          >
                            {speakingMessageId === msg.id ? (
                              <>
                                <VolumeX className="w-3 h-3" />
                                <span>Stop Voice</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Suggested follow-up chips */}
                    {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestedFollowUps.map((fu, fuIdx) => (
                          <button
                            key={fuIdx}
                            onClick={() => handleSend(fu)}
                            className="text-[11px] px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-full transition-all cursor-pointer flex items-center space-x-1 shadow-2xs"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                            <span>{fu}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Loading bubble */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 rounded-tl-none flex items-center space-x-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-indigo-600 font-medium">Vertex Tutor is reasoning...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-end space-x-2">
            <textarea
              id="input-tutor-message"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask your ${personas.find((p) => p.id === selectedPersona)?.name} anything... (Shift+Enter for new line)`}
              rows={2}
              className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-['Plus_Jakarta_Sans',sans-serif]"
            />
            <button
              id="btn-send-tutor-message"
              disabled={!inputText.trim() || isLoading}
              onClick={() => handleSend()}
              className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                inputText.trim() && !isLoading
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
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
