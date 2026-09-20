import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  BrainCircuit, 
  Award, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  BookOpen, 
  HelpCircle, 
  Video, 
  Code2, 
  ExternalLink,
  Copy,
  Check,
  Hourglass,
  Layers,
  ListChecks,
  Tag,
  Target,
  CheckCircle2,
  FolderOpen,
  Folder,
  Terminal,
  PlayCircle,
  FileText
} from "lucide-react";
import { Course, Lesson } from "../types";
import { SpeechNarrator, fireCelebration } from "../utils/audioAndFx";
import { LessonResourcesSection } from "./LessonResourcesSection";
import { getLessonResources } from "../utils/lessonResources";

interface ClassroomViewProps {
  courses?: Course[];
  course: Course;
  currentLesson: Lesson;
  completedLessons: Set<string>;
  onSelectCourse?: (course: Course) => void;
  onSelectLesson: (lesson: Lesson) => void;
  onCompleteLesson: (lessonId: string) => void;
  onAskTutorWithContext: (lesson: Lesson, customPrompt?: string) => void;
  onNavigateToAssessments: (topic: string) => void;
}

export const ClassroomView: React.FC<ClassroomViewProps> = ({
  courses = [],
  course,
  currentLesson,
  completedLessons,
  onSelectCourse,
  onSelectLesson,
  onCompleteLesson,
  onAskTutorWithContext,
  onNavigateToAssessments,
}) => {
  // Active sub-section tab inside the active module
  const [activeModuleTab, setActiveModuleTab] = useState<"theory" | "video" | "code" | "resources" | "checkpoint" | "all">("all");

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedCheckpointOption, setSelectedCheckpointOption] = useState<number | null>(null);
  const [checkpointSubmitted, setCheckpointSubmitted] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    SpeechNarrator.setCallback((speaking) => {
      setIsSpeaking(speaking);
    });

    return () => {
      SpeechNarrator.stop();
    };
  }, []);

  // Reset checkpoint state and voice narration on lesson change
  useEffect(() => {
    setSelectedCheckpointOption(null);
    setCheckpointSubmitted(false);
    setCopiedCode(false);
    SpeechNarrator.stop();
  }, [currentLesson.id]);

  const toggleNarration = () => {
    if (isSpeaking) {
      SpeechNarrator.stop();
    } else {
      const speechContent = `${currentLesson.title}. ${currentLesson.summary}. ${currentLesson.contentMarkdown}`;
      SpeechNarrator.speak(speechContent);
    }
  };

  const handleCompleteCurrentLesson = () => {
    onCompleteLesson(currentLesson.id);
    fireCelebration();
  };

  const handleCopyCodeSnippet = (codeText: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(codeText);
      }
    } catch {
      // Fallback
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Find next and previous lesson in course
  let nextLesson: Lesson | null = null;
  let prevLesson: Lesson | null = null;
  let allLessons: Lesson[] = [];
  course.modules.forEach((m) => {
    allLessons = allLessons.concat(m.lessons);
  });

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  if (currentIndex > 0) prevLesson = allLessons[currentIndex - 1];
  if (currentIndex < allLessons.length - 1) nextLesson = allLessons[currentIndex + 1];

  const isCompleted = completedLessons.has(currentLesson.id);

  // Syllabus & Time Assessment Calculations
  const totalCourseMinutes = allLessons.reduce((acc, l) => acc + (l.durationMinutes || 15), 0);
  const totalCourseHours = Math.floor(totalCourseMinutes / 60);
  const totalCourseMinsRemainder = totalCourseMinutes % 60;

  const completedLessonsCount = allLessons.filter((l) => completedLessons.has(l.id)).length;
  const completedMinutes = allLessons
    .filter((l) => completedLessons.has(l.id))
    .reduce((acc, l) => acc + (l.durationMinutes || 15), 0);
  const progressPercent = allLessons.length > 0 ? Math.round((completedLessonsCount / allLessons.length) * 100) : 0;

  const remainingMinutes = Math.max(0, totalCourseMinutes - completedMinutes);
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMinsRemainder = remainingMinutes % 60;

  const estimatedDaysToFinish = Math.max(1, Math.ceil(remainingMinutes / 45));
  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + estimatedDaysToFinish);
  const formattedFinishDate = finishDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  // Resolve resources strictly scoped to this selected course and lesson
  const lessonResources = getLessonResources(course, currentLesson);

  // Find current module
  const currentModule = course.modules.find((m) => m.lessons.some((l) => l.id === currentLesson.id)) || course.modules[0];
  const currentModuleIndex = course.modules.findIndex((m) => m.id === currentModule?.id);

  // Extract code snippet: check lesson.codeSnippet or parse markdown
  const effectiveCodeSnippet = currentLesson.codeSnippet || (() => {
    const codeMatch = currentLesson.contentMarkdown.match(/```([a-z0-9_-]*)\n([\s\S]*?)```/i);
    if (codeMatch) {
      return {
        title: `${currentLesson.title} Code Implementation`,
        language: codeMatch[1] || "typescript",
        code: codeMatch[2].trim(),
        explanation: "Production-ready implementation illustrating core architectural patterns.",
      };
    }
    return null;
  })();

  // Select a module: opens it on the right side and displays its content
  const handleSelectModule = (mod: (typeof course.modules)[0]) => {
    const hasCurrentLesson = mod.lessons.some((l) => l.id === currentLesson.id);
    if (!hasCurrentLesson && mod.lessons.length > 0) {
      onSelectLesson(mod.lessons[0]);
    }
  };

  return (
    <div className="space-y-6 pb-16 min-w-0 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. TOP COURSE SELECTOR BANNER */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                {course.category}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-600">{course.difficulty || "Intermediate"}</span>
              <span>•</span>
              <span className="text-slate-500 font-semibold">{course.modules.length} Modules</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit',sans-serif] leading-tight">
              {course.title}
            </h1>
            <p className="text-xs text-slate-500 line-clamp-1">
              {course.tagline}
            </p>
          </div>

          {/* Course Selector Dropdown & Assessment Button */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {courses.length > 1 && onSelectCourse && (
              <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-600 shrink-0">Switch Course:</span>
                <select
                  id="select-classroom-course"
                  value={course.id}
                  onChange={(e) => {
                    const targetCourse = courses.find((c) => c.id === e.target.value);
                    if (targetCourse) {
                      onSelectCourse(targetCourse);
                    }
                  }}
                  className="text-xs font-bold text-indigo-900 bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.modules.length} modules)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              id="btn-take-course-assessment"
              onClick={() => onNavigateToAssessments(course.title)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Course Assessment</span>
            </button>
          </div>
        </div>

        {/* Course Progress Summary Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Course Mastery</span>
            <span className="text-sm font-bold text-indigo-600">{progressPercent}% Completed</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Completed Topics</span>
            <span className="text-sm font-bold text-slate-800">{completedLessonsCount} of {allLessons.length}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Duration</span>
            <span className="text-sm font-bold text-slate-800">{totalCourseHours}h {totalCourseMinsRemainder}m</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Est. Completion</span>
            <span className="text-sm font-bold text-emerald-700">{remainingMinutes === 0 ? "Mastered" : `~${estimatedDaysToFinish} days`}</span>
          </div>
        </div>
      </div>



      {/* 2. COURSE MODULES NAVIGATION: Click Module 1, 2, 3, 4 to open fully */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ListChecks className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Course Curriculum Modules ({course.modules.length})
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Click any module to open it in full view
          </span>
        </div>

        {/* Horizontal Module Cards Grid */}
        <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 ${
          course.modules.length <= 2 ? "lg:grid-cols-2" : course.modules.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
        }`}>
          {course.modules.map((mod, modIdx) => {
            const isCurrentMod = currentModule?.id === mod.id;
            const modMinutes = mod.lessons.reduce((acc, l) => acc + (l.durationMinutes || 15), 0);
            const modDoneCount = mod.lessons.filter((l) => completedLessons.has(l.id)).length;
            const isModComplete = modDoneCount === mod.lessons.length && mod.lessons.length > 0;

            return (
              <button
                key={mod.id}
                id={`btn-module-nav-${mod.id}`}
                onClick={() => handleSelectModule(mod)}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between space-y-2 transition-all cursor-pointer ${
                  isCurrentMod
                    ? "border-indigo-600 bg-indigo-50/40 shadow-xs ring-2 ring-indigo-500/20"
                    : isModComplete
                    ? "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300 hover:bg-emerald-50/40"
                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isCurrentMod
                        ? "bg-indigo-600 text-white"
                        : isModComplete
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Module {modIdx + 1}
                  </span>
                  {isModComplete ? (
                    <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Done</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">
                      {modMinutes}m • {mod.lessons.length} {mod.lessons.length === 1 ? "Topic" : "Topics"}
                    </span>
                  )}
                </div>

                <div className={`font-bold text-xs sm:text-sm line-clamp-2 leading-snug ${
                  isCurrentMod ? "text-indigo-950" : "text-slate-800"
                }`}>
                  {mod.title}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100/80 w-full">
                  <span className={isCurrentMod ? "text-indigo-600 font-bold" : ""}>
                    {isCurrentMod ? "Currently Active" : "Click to Open"}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {modDoneCount}/{mod.lessons.length} completed
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FULL-WIDTH MODULE VIEWER & TOPIC CONTENT */}
      <div className="w-full space-y-6 min-w-0">
          {/* Active Module Overview Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {currentModuleIndex + 1}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                      Module {currentModuleIndex + 1} of {course.modules.length}
                    </span>
                    <span className="text-[11px] text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {currentModule.lessons.reduce((acc, l) => acc + (l.durationMinutes || 15), 0)} mins • {currentModule.lessons.length} {currentModule.lessons.length === 1 ? "Topic" : "Topics"}
                    </span>
                    {currentModule.lessons.every((l) => completedLessons.has(l.id)) && (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Module Mastered
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit',sans-serif] truncate">
                    {currentModule.title}
                  </h2>
                </div>
              </div>

              {/* Quick Module Switcher Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                {currentModuleIndex > 0 && (
                  <button
                    onClick={() => onSelectLesson(course.modules[currentModuleIndex - 1].lessons[0])}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center space-x-1 cursor-pointer transition-colors"
                    title={`Switch to Module ${currentModuleIndex}`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Module {currentModuleIndex}</span>
                  </button>
                )}
                {currentModuleIndex < course.modules.length - 1 && (
                  <button
                    onClick={() => onSelectLesson(course.modules[currentModuleIndex + 1].lessons[0])}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 hover:bg-indigo-100 flex items-center space-x-1 cursor-pointer transition-colors"
                    title={`Switch to Module ${currentModuleIndex + 2}`}
                  >
                    <span>Module {currentModuleIndex + 2}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sub-Topics Tabs (if module contains multiple lessons) */}
            {currentModule.lessons.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600 px-2">Topics in Module {currentModuleIndex + 1}:</span>
                {currentModule.lessons.map((lesson, idx) => {
                  const isTopicActive = lesson.id === currentLesson.id;
                  const isTopicDone = completedLessons.has(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      id={`btn-topic-${lesson.id}`}
                      onClick={() => onSelectLesson(lesson)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isTopicActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                      }`}
                    >
                      {isTopicDone && (
                        <CheckCircle className={`w-3.5 h-3.5 ${isTopicActive ? "text-white" : "text-emerald-500"}`} />
                      )}
                      <span>Topic {idx + 1}: {lesson.title}</span>
                      <span className={`text-[10px] ${isTopicActive ? "text-indigo-200" : "text-slate-400"}`}>
                        ({lesson.durationMinutes}m)
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Topic Full Content Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 space-y-6 shadow-xs animate-fadeIn">

                      {/* Active Lesson Header & Quick Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <span className="font-semibold text-indigo-600">Active Topic</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{currentLesson.durationMinutes} mins</span>
                            </span>
                            {isCompleted && (
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Topic Mastered
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                            {currentLesson.title}
                          </h3>
                        </div>

                        {/* Toolbar: Read Aloud & Ask AI Tutor */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            id="btn-toggle-speech"
                            onClick={toggleNarration}
                            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                              isSpeaking
                                ? "bg-amber-500 text-white border-amber-600 animate-pulse"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                            title={isSpeaking ? "Stop AI Voice Narration" : "Listen to Lesson (AI Voice)"}
                          >
                            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
                            <span>{isSpeaking ? "Speaking..." : "Read Aloud"}</span>
                          </button>

                          <button
                            id="btn-ask-tutor-lesson"
                            onClick={() => onAskTutorWithContext(currentLesson)}
                            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer"
                            title="Ask AI Tutor with this topic's context"
                          >
                            <BrainCircuit className="w-4 h-4 text-indigo-600" />
                            <span>Ask Tutor</span>
                          </button>
                        </div>
                      </div>

                      {/* Lesson Summary Callout */}
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <strong className="font-bold text-slate-900">Topic Overview: </strong>
                        {currentLesson.summary}
                      </div>

                      {/* Content Category Tabs: Theory, Video, Code, Resources, Checkpoint, All */}
                      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
                        <button
                          onClick={() => setActiveModuleTab("all")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            activeModuleTab === "all"
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          All Sections
                        </button>
                        <button
                          onClick={() => setActiveModuleTab("theory")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                            activeModuleTab === "theory"
                              ? "bg-indigo-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>1. Theory</span>
                        </button>
                        <button
                          onClick={() => setActiveModuleTab("video")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                            activeModuleTab === "video"
                              ? "bg-rose-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <Video className="w-3.5 h-3.5 text-rose-500" />
                          <span>2. Video Lecture</span>
                        </button>
                        <button
                          onClick={() => setActiveModuleTab("code")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                            activeModuleTab === "code"
                              ? "bg-emerald-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>3. Code Implementation</span>
                        </button>
                        <button
                          onClick={() => setActiveModuleTab("resources")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                            activeModuleTab === "resources"
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                          <span>4. Official Resources</span>
                        </button>
                        {currentLesson.checkpoint && (
                          <button
                            onClick={() => setActiveModuleTab("checkpoint")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                              activeModuleTab === "checkpoint"
                                ? "bg-amber-600 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span>5. Quiz Checkpoint</span>
                          </button>
                        )}
                      </div>

                      {/* SECTION 1: THEORY & ARCHITECTURE */}
                      {(activeModuleTab === "all" || activeModuleTab === "theory") && (
                        <div id="section-theory" className="space-y-4 pt-2">
                          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            <span>Theoretical Concepts & Architecture</span>
                          </div>

                          {/* Key Terms Tags */}
                          {currentLesson.keyTerms && currentLesson.keyTerms.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-400 mr-1">Core Competencies:</span>
                              {currentLesson.keyTerms.map((term) => (
                                <span
                                  key={term}
                                  className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                                >
                                  {term}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Formatted Markdown Body */}
                          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4">
                            {currentLesson.contentMarkdown.split("\n\n").map((block, idx) => {
                              // If block is code, render in code section or inline if viewing all
                              if (block.startsWith("```")) {
                                return null; // rendered in dedicated Code section
                              }

                              const renderFormattedText = (text: string) => {
                                const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
                                return parts.map((part, pIdx) => {
                                  if (part.startsWith("**") && part.endsWith("**")) {
                                    return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
                                  }
                                  if (part.startsWith("`") && part.endsWith("`")) {
                                    return <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono text-xs border border-slate-200">{part.slice(1, -1)}</code>;
                                  }
                                  return part;
                                });
                              };

                              if (block.startsWith("### ")) {
                                return (
                                  <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-900 pt-3 pb-1 border-b border-slate-100">
                                    {renderFormattedText(block.replace("### ", ""))}
                                  </h3>
                                );
                              }

                              if (block.startsWith("#### ")) {
                                return (
                                  <h4 key={idx} className="text-sm font-bold text-indigo-900 pt-2">
                                    {renderFormattedText(block.replace("#### ", ""))}
                                  </h4>
                                );
                              }

                              if (/^\d+\.\s/.test(block.trim())) {
                                const items = block.split("\n").filter((item) => /^\d+\.\s/.test(item.trim()));
                                return (
                                  <ol key={idx} className="list-decimal list-outside ml-5 space-y-2 my-2 text-slate-700">
                                    {items.map((item, itemIdx) => (
                                      <li key={itemIdx} className="text-slate-700 leading-relaxed pl-1">
                                        {renderFormattedText(item.trim().replace(/^\d+\.\s*/, ""))}
                                      </li>
                                    ))}
                                  </ol>
                                );
                              }

                              if (block.startsWith("- ") || block.startsWith("* ")) {
                                const items = block.split("\n").filter((item) => item.startsWith("- ") || item.startsWith("* "));
                                return (
                                  <ul key={idx} className="list-disc list-outside ml-5 space-y-2 my-2 text-slate-700">
                                    {items.map((item, itemIdx) => (
                                      <li key={itemIdx} className="text-slate-700 leading-relaxed pl-1">
                                        {renderFormattedText(item.trim().replace(/^[-*]\s*/, ""))}
                                      </li>
                                    ))}
                                  </ul>
                                );
                              }

                              return (
                                <p key={idx} className="leading-relaxed text-slate-700">
                                  {renderFormattedText(block)}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* SECTION 2: CURATED VIDEO LECTURE */}
                      {(activeModuleTab === "all" || activeModuleTab === "video") && (
                        <div id="section-video" className="space-y-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                              <Video className="w-4 h-4 text-rose-600" />
                              <span>Curated Video Lecture (Scoped to {course.title})</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                              Duration: {lessonResources.video.duration}
                            </span>
                          </div>

                          {/* Video Player Card */}
                          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-md border border-slate-800">
                            <div className="relative aspect-video w-full bg-black">
                              <iframe
                                src={lessonResources.video.embedUrl}
                                title={lessonResources.video.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>

                            <div className="p-4 bg-slate-950 text-slate-200 space-y-2">
                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <span className="font-semibold text-indigo-400">{lessonResources.video.channel}</span>
                                <span>{lessonResources.video.duration}</span>
                              </div>
                              <h4 className="font-bold text-sm text-white leading-snug">
                                {lessonResources.video.title}
                              </h4>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {lessonResources.video.description}
                              </p>

                              {/* Key Takeaways */}
                              {lessonResources.video.keyTakeaways && (
                                <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                                    Key Architectural Takeaways:
                                  </span>
                                  <ul className="space-y-1 text-xs text-slate-300">
                                    {lessonResources.video.keyTakeaways.map((takeaway, tkIdx) => (
                                      <li key={tkIdx} className="flex items-start space-x-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>{takeaway}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SECTION 3: PRACTICAL CODE IMPLEMENTATION */}
                      {(activeModuleTab === "all" || activeModuleTab === "code") && effectiveCodeSnippet && (
                        <div id="section-code" className="space-y-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                              <Code2 className="w-4 h-4 text-emerald-600" />
                              <span>Code Implementation & Patterns</span>
                            </div>
                            <button
                              id="btn-copy-code"
                              onClick={() => handleCopyCodeSnippet(effectiveCodeSnippet.code)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              {copiedCode ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Copy Code</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-md">
                            {/* Editor Top Bar */}
                            <div className="bg-slate-900 px-4 py-2 text-xs font-mono text-slate-300 flex items-center justify-between border-b border-slate-800">
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1.5">
                                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                </div>
                                <span className="font-semibold text-slate-200 pl-2">{effectiveCodeSnippet.title}</span>
                              </div>
                              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-400">
                                {effectiveCodeSnippet.language}
                              </span>
                            </div>

                            {/* Code Body */}
                            <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed text-slate-200">
                              <code>{effectiveCodeSnippet.code}</code>
                            </pre>

                            {/* Architectural Explanation */}
                            {Boolean((effectiveCodeSnippet as any).explanation) && (
                              <div className="p-3.5 bg-slate-900/80 border-t border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start space-x-2">
                                <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-white font-semibold">Implementation Note: </strong>
                                  {(effectiveCodeSnippet as any).explanation}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SECTION 4: AUTHORITATIVE REFERENCE LINKS & OFFICIAL DOCS */}
                      {(activeModuleTab === "all" || activeModuleTab === "resources") && (
                        <div id="section-resources" className="space-y-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                              <ExternalLink className="w-4 h-4 text-blue-600" />
                              <span>Authoritative Reference Documentation ({lessonResources.referenceLinks.length})</span>
                            </div>
                            <span className="text-xs text-slate-500 font-semibold">
                              Verified Official Specs
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {lessonResources.referenceLinks.map((link, lkIdx) => (
                              <div
                                key={lkIdx}
                                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-2xs space-y-2 flex flex-col justify-between"
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                      {link.category}
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-400">{link.sourceName}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                    {link.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                    {link.description}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                  >
                                    <span>Open Documentation</span>
                                    <ExternalLink className="w-3 h-3 ml-0.5" />
                                  </a>
                                  <button
                                    onClick={() => handleCopyCodeSnippet(link.url)}
                                    className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center space-x-1"
                                    title="Copy Link"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>Copy URL</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SECTION 5: COMPREHENSION CHECKPOINT QUIZ */}
                      {(activeModuleTab === "all" || activeModuleTab === "checkpoint") && currentLesson.checkpoint && (
                        <div id="section-checkpoint" className="mt-8 p-5 sm:p-6 bg-gradient-to-r from-slate-50 to-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                          <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                            <HelpCircle className="w-4 h-4 text-indigo-600" />
                            <span>Comprehension Checkpoint</span>
                          </div>
                          <h4 className="font-semibold text-sm sm:text-base text-slate-900">
                            {currentLesson.checkpoint.question}
                          </h4>

                          <div className="space-y-2">
                            {currentLesson.checkpoint.options.map((opt, optIdx) => {
                              const isSelected = selectedCheckpointOption === optIdx;
                              let optionStyle = "border-slate-200 hover:border-indigo-300 bg-white text-slate-700";

                              if (checkpointSubmitted) {
                                if (optIdx === currentLesson.checkpoint!.correctIndex) {
                                  optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500";
                                } else if (isSelected) {
                                  optionStyle = "border-rose-400 bg-rose-50 text-rose-800";
                                }
                              } else if (isSelected) {
                                optionStyle = "border-indigo-600 bg-indigo-50/70 text-indigo-900 font-medium ring-1 ring-indigo-500";
                              }

                              return (
                                <button
                                  key={optIdx}
                                  id={`checkpoint-opt-${optIdx}`}
                                  disabled={checkpointSubmitted}
                                  onClick={() => setSelectedCheckpointOption(optIdx)}
                                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${optionStyle}`}
                                >
                                  <div className="flex items-start space-x-2.5">
                                    <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {!checkpointSubmitted ? (
                            <button
                              id="btn-submit-checkpoint"
                              disabled={selectedCheckpointOption === null}
                              onClick={() => setCheckpointSubmitted(true)}
                              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                                selectedCheckpointOption !== null
                                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              Verify Answer
                            </button>
                          ) : (
                            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm space-y-1.5 shadow-2xs">
                              <div className="font-bold flex items-center space-x-1.5">
                                {selectedCheckpointOption === currentLesson.checkpoint.correctIndex ? (
                                  <span className="text-emerald-600 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-1.5" /> Correct! Outstanding reasoning.
                                  </span>
                                ) : (
                                  <span className="text-rose-600">Review the correct rationale:</span>
                                )}
                              </div>
                              <p className="text-slate-600 leading-relaxed">
                                {currentLesson.checkpoint.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Module Bottom Navigation & Completion Controls */}
                      <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          {prevLesson && (
                            <button
                              id="btn-prev-lesson"
                              onClick={() => onSelectLesson(prevLesson!)}
                              className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                              <span>Previous Topic</span>
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            id="btn-complete-lesson"
                            onClick={handleCompleteCurrentLesson}
                            className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                              isCompleted
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>{isCompleted ? "Topic Mastered (+50 XP)" : "Mark Complete (+50 XP)"}</span>
                          </button>

                          {nextLesson && (
                            <button
                              id="btn-next-lesson"
                              onClick={() => onSelectLesson(nextLesson!)}
                              className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                            >
                              <span>Next Topic</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            };
