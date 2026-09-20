import React, { useState } from "react";
import { 
  BookOpen, 
  Clock, 
  Award, 
  BarChart3, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Filter,
  BrainCircuit,
  Compass,
  FileCheck,
  Layers,
  Code2,
  Server,
  Database,
  ShieldCheck,
  ChevronRight,
  Crown,
  Lock
} from "lucide-react";
import { Course, StudentProfile, Lesson, AssessmentHistoryItem } from "../types";
import { INITIAL_COURSES } from "../data/mockCourses";
import { DEFAULT_PROFILE, getCourseForTrack } from "../utils/storage";
import { getCourseAssignmentModules, filterAssessmentsByCourse } from "../utils/courseAssignments";

interface DashboardViewProps {
  courses?: Course[];
  profile?: StudentProfile;
  completedLessons?: Set<string>;
  assessmentHistory?: AssessmentHistoryItem[];
  onSelectCourse: (course: Course) => void;
  onSelectLesson: (course: Course, lesson: Lesson) => void;
  onLaunchAssessment: (topic: string) => void;
  onLaunchTutor: (topic: string) => void;
  onNavigateToCreator: () => void;
  onNavigateToAssessments?: () => void;
  onOpenRoleModal?: () => void;
  onOpenCertificate?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  courses = [],
  profile = DEFAULT_PROFILE,
  completedLessons = new Set<string>(),
  assessmentHistory = [],
  onSelectCourse,
  onSelectLesson,
  onLaunchAssessment,
  onLaunchTutor,
  onNavigateToCreator,
  onNavigateToAssessments,
  onOpenRoleModal,
  onOpenCertificate,
}) => {
  // Course view mode: default strictly to enrolled course only as requested
  const [courseViewMode, setCourseViewMode] = useState<"enrolled" | "all">("enrolled");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Full Stack Development", "Artificial Intelligence", "Machine Learning", "Cloud Engineering", "Custom AI"];

  const safeCourses = Array.isArray(courses) && courses.length > 0 ? courses : INITIAL_COURSES;
  const safeProfile = profile || DEFAULT_PROFILE;
  const safeCompletedLessons = completedLessons instanceof Set
    ? completedLessons
    : Array.isArray(completedLessons)
    ? new Set<string>(completedLessons)
    : new Set<string>();

  // Specifically identify user's enrolled track course
  const enrolledCourse = getCourseForTrack(safeProfile.role, safeCourses) || safeCourses[0] || INITIAL_COURSES[0];
  const enrolledModules = Array.isArray(enrolledCourse?.modules) ? enrolledCourse.modules : [];

  // Compute lesson completion stats specifically for this course
  const enrolledTotalLessons = enrolledModules.reduce((acc, m) => acc + (Array.isArray(m?.lessons) ? m.lessons.length : 0), 0);
  const enrolledDoneLessons = enrolledModules.reduce(
    (acc, m) => acc + (Array.isArray(m?.lessons) ? m.lessons.filter((l) => safeCompletedLessons.has(l?.id)).length : 0),
    0
  );
  const enrolledProgress = enrolledTotalLessons > 0 ? Math.round((enrolledDoneLessons / enrolledTotalLessons) * 100) : 0;
  const isEnrolledCourseCompleted = enrolledTotalLessons > 0 && enrolledDoneLessons === enrolledTotalLessons;

  // Filtered courses: If view mode is 'enrolled', strictly show only that one course!
  const displayedCourses = courseViewMode === "enrolled"
    ? [enrolledCourse].filter(Boolean)
    : safeCourses.filter((c) => {
        if (!c) return false;
        if (selectedCategory === "All") return true;
        if (selectedCategory === "Custom AI") return Boolean(c.isCustomGenerated);
        return c.category === selectedCategory;
      });

  // Find active lesson: check enrolled course first
  let activeCourse = enrolledCourse;
  let activeLesson = enrolledModules[0]?.lessons?.[0];
  let foundIncomplete = false;

  for (const m of enrolledModules) {
    for (const l of m?.lessons || []) {
      if (!safeCompletedLessons.has(l?.id)) {
        activeLesson = l;
        foundIncomplete = true;
        break;
      }
    }
    if (foundIncomplete) break;
  }

  const competenciesList = Array.isArray(safeProfile.trackCompetencies) ? safeProfile.trackCompetencies : [];
  const avgProficiency = competenciesList.length > 0
    ? Math.round(competenciesList.reduce((acc, c) => acc + (typeof c?.proficiency === "number" ? c.proficiency : 85), 0) / competenciesList.length)
    : (isEnrolledCourseCompleted ? 100 : 85);

  const getCompetencyIcon = (category: string) => {
    switch (category) {
      case "Frontend":
        return <Code2 className="w-3.5 h-3.5 text-blue-500" />;
      case "Backend":
        return <Server className="w-3.5 h-3.5 text-emerald-500" />;
      case "Database":
        return <Database className="w-3.5 h-3.5 text-amber-500" />;
      case "Architecture":
        return <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  // Track diagnostic content based on the active specialization
  const getTrackDiagnostics = (track: string) => {
    const t = (track || "").toLowerCase();
    if (t.includes("ai") || t.includes("rag") || t.includes("generative") || t.includes("artificial")) {
      return {
        strengths: [
          { name: "Vector Embeddings & Cosine Distance", score: "99%", tag: "Embeddings" },
          { name: "Prompt Chaining & Temperature Tuning", score: "97%", tag: "Prompt Eng" },
          { name: "Hybrid Search Lexical + Dense", score: "95%", tag: "Retrieval" },
          { name: "Context Window Token Optimization", score: "94%", tag: "LLM Ops" },
        ],
        weak: [
          { name: "Reciprocal Rank Fusion Weighting", status: "Checkpoint Pending", topic: "Ranking Logic", score: "82%" },
          { name: "Multi-Agent Deterministic Fallbacks", status: "Needs Practice", topic: "Agent Systems", score: "76%" },
        ],
        step1: "Ask the AI Tutor how Reciprocal Rank Fusion balances lexical BM25 with dense embedding vectors.",
        step1Query: "Reciprocal Rank Fusion and Hybrid RAG Scoring",
        step2: "Validate your knowledge on Cross-Encoder Rerank Latency.",
        step2Topic: "Hybrid RAG & Reciprocal Rank Fusion",
      };
    }
    if (t.includes("cloud") || t.includes("devops")) {
      return {
        strengths: [
          { name: "Docker Multi-Stage Production Builds", score: "98%", tag: "Containers" },
          { name: "Kubernetes Health Probes & Rollouts", score: "96%", tag: "Orchestration" },
          { name: "Nginx Ingress Reverse Proxy", score: "95%", tag: "Networking" },
          { name: "CI/CD GitHub Actions Pipelines", score: "93%", tag: "DevOps" },
        ],
        weak: [
          { name: "Istio Service Mesh Canary Routing", status: "Checkpoint Pending", topic: "Service Mesh", score: "79%" },
          { name: "Terraform State Locking & DynamoDB", status: "Needs Practice", topic: "IaC", score: "74%" },
        ],
        step1: "Inquire how Kubernetes readiness probes prevent cascading 503 errors during rolling updates.",
        step1Query: "Kubernetes Liveness and Readiness Probe Failures",
        step2: "Validate your knowledge of Container Ephemeral Storage and Graceful Termination.",
        step2Topic: "Kubernetes Health & Graceful Shutdowns",
      };
    }
    if (t.includes("machine") || t.includes("learning")) {
      return {
        strengths: [
          { name: "Cross-Entropy Loss & Softmax Math", score: "99%", tag: "Math" },
          { name: "PyTorch Tensor Operations & Autograd", score: "96%", tag: "Framework" },
          { name: "Backpropagation & Learning Rate Warmup", score: "95%", tag: "Optimization" },
          { name: "Feature Scaling & Batch Normalization", score: "92%", tag: "Data Prep" },
        ],
        weak: [
          { name: "Multi-Head Self-Attention QKV Projection", status: "Checkpoint Pending", topic: "Transformers", score: "81%" },
          { name: "LoRA Low-Rank Parameter Fine-Tuning", status: "Needs Practice", topic: "Fine-Tuning", score: "73%" },
        ],
        step1: "Ask the AI Tutor how Query-Key-Value dot-product scaling controls vanishing gradients.",
        step1Query: "Scaled Dot-Product Attention in Transformers",
        step2: "Validate your knowledge of Dropout, Weight Decay, and LayerNorm placement.",
        step2Topic: "Deep Learning Foundations & Backpropagation",
      };
    }
    // Default: Full Stack Development
    return {
      strengths: [
        { name: "React 19 Hooks & Optimistic Updates", score: "100%", tag: "Frontend" },
        { name: "PostgreSQL ACID & Pool Tuning", score: "98%", tag: "Database" },
        { name: "Express REST & JWT Auth Middleware", score: "96%", tag: "Backend" },
        { name: "Tailwind CSS Responsive Architecture", score: "95%", tag: "UI/UX" },
      ],
      weak: [
        { name: "Distributed Lock Redlock Algorithm", status: "Needs Practice", topic: "Distributed Systems", score: "78%" },
        { name: "Redis Cache Stampede Jitter & Expiration", status: "Checkpoint Pending", topic: "Caching", score: "82%" },
      ],
      step1: "Ask the AI Tutor how probabilistic early expiration prevents thundering herd queries.",
      step1Query: "Redis Cache Stampede and Early Expiration",
      step2: "Validate your understanding of Circuit Breakers and Eventual Consistency.",
      step2Topic: "Microservices Resiliency & Circuit Breakers",
    };
  };

  const diagnostics = getTrackDiagnostics(safeProfile.role || enrolledCourse?.category || "Full Stack Development");

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome & Personalized Learning Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personalized Learning Engine Active</span>
              </div>
              <button
                onClick={onOpenRoleModal}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold tracking-wide border border-blue-400/40 transition-colors cursor-pointer"
                title="Manage career role and view competencies"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Track: {safeProfile.role || enrolledCourse?.category || "Full Stack Development"}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit',sans-serif]">
              Welcome back, {safeProfile.name || "Student"}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 font-medium">
              {safeProfile.title || "Scholar"} • Specialization: <strong className="text-white">{safeProfile.role || enrolledCourse?.category || "Full Stack Development"}</strong>
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your adaptive AI tutor has tailored your micro-lessons and code walk-throughs for <strong className="text-indigo-200">{enrolledCourse?.title || "Your Enrolled Track"}</strong>. You have achieved <strong className="text-indigo-300">{enrolledDoneLessons} of {enrolledTotalLessons} lessons ({enrolledProgress}%)</strong> with an active <strong className="text-amber-300">{safeProfile.streakDays || 1}-day streak</strong>!
            </p>
          </div>

          {/* Quick Resume Card */}
          {activeLesson && (
            <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl max-w-sm w-full space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold uppercase tracking-wider text-indigo-300">
                  {isEnrolledCourseCompleted ? "Course Mastered" : "Next Up"}
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{activeLesson.durationMinutes} min</span>
                </span>
              </div>
              <div>
                <h2 className="font-bold text-sm text-white line-clamp-1">{activeLesson.title}</h2>
                <p className="text-xs text-slate-300 line-clamp-1">{activeCourse.title}</p>
              </div>
              <button
                id="btn-resume-lesson"
                onClick={() => onSelectLesson(activeCourse, activeLesson)}
                className="w-full py-2 px-3 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isEnrolledCourseCompleted ? "Review Lesson" : "Resume Lesson"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium">
            <span>Course Progress</span>
            <CheckCircle2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isEnrolledCourseCompleted ? "text-emerald-500" : "text-indigo-500"}`} />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">{enrolledProgress}%</div>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium">
            {enrolledDoneLessons}/{enrolledTotalLessons} lessons completed
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium">
            <span>Study Velocity</span>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">{safeProfile.studyMinutesThisWeek || 180} <span className="text-xs sm:text-sm font-normal text-slate-500">mins</span></div>
          <p className="text-[10px] sm:text-[11px] text-blue-600 font-medium">Goal: 350 mins/week</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium">
            <span>Level & Tier</span>
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">Level {safeProfile.level || 1}</div>
          <p className="text-[10px] sm:text-[11px] text-indigo-600 font-medium">{safeProfile.xp || 250} XP total</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium">
            <span>Curriculum Mastery</span>
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center space-x-1.5">
            <span>{avgProficiency}%</span>
            {avgProficiency === 100 && (
              <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-400 inline" />
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium truncate">
            {isEnrolledCourseCompleted ? "100% Course Mastery" : "Active Syllabus Track"}
          </p>
        </div>
      </div>

      {/* Dynamic Career Specialization Card - adapts strictly to student's enrolled course */}
      <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-800">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Career Specialization Track</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">Enrolled</span>
              {isEnrolledCourseCompleted ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center space-x-1">
                  <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                  <span>100% Completed</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                  {enrolledProgress}% In Progress
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
              {enrolledCourse.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {enrolledCourse.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                id="btn-open-enrolled-course"
                onClick={() => onSelectCourse(enrolledCourse)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{enrolledProgress > 0 ? "Continue Course" : "Enter Course Classroom"}</span>
              </button>

              <button
                onClick={() => onLaunchTutor(enrolledCourse.title)}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tutor Practice</span>
              </button>

              {onOpenRoleModal && (
                <button
                  onClick={onOpenRoleModal}
                  className="px-3.5 py-1.5 bg-transparent hover:bg-blue-100/60 text-blue-700 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <span>View All Competencies</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Competencies Snapshot */}
          <div className="lg:w-80 shrink-0 bg-white p-4 rounded-xl border border-blue-100 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center space-x-1.5">
                <span>Track Competencies</span>
                {avgProficiency === 100 && (
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                )}
              </span>
              <span className="text-emerald-600 font-extrabold">{avgProficiency}% Avg</span>
            </div>

            <div className="space-y-2 text-xs">
              {(safeProfile.trackCompetencies || []).slice(0, 3).map((comp, idx) => {
                const skillLabel = typeof comp?.skill === "string"
                  ? (comp.skill.includes("(") ? comp.skill.split("(")[0].trim() : comp.skill)
                  : "Core Competency";
                const profValue = typeof comp?.proficiency === "number" ? comp.proficiency : 85;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span className="flex items-center space-x-1 font-medium">
                        {getCompetencyIcon(comp?.category || "General")}
                        <span className="truncate max-w-[160px]">{skillLabel}</span>
                      </span>
                      <span className="font-bold text-slate-800">{profValue}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${profValue}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic: Strong vs Weak Topics & AI Study Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Diagnostic */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2 font-['Outfit',sans-serif]">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
              <span>Skill Mastery Diagnostic ({safeProfile.role || enrolledCourse?.category || "Full Stack Development"})</span>
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              AI Evaluated
            </span>
          </div>

          <div className="space-y-3">
            {/* Strong Topics */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demonstrated Strengths (90%+ Mastery)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(diagnostics?.strengths || []).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-emerald-800">{item.tag}</div>
                    </div>
                    <span className="font-extrabold text-emerald-700">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth / In-Progress Topics */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Target Focus Areas (Recommended Practice)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(diagnostics?.weak || []).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-amber-800">{item.status}</div>
                    </div>
                    <button
                      onClick={() => onLaunchAssessment(item.name)}
                      className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shadow-xs cursor-pointer"
                    >
                      Practice ({item.score})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI-Generated Study Suggestions */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-md border border-indigo-800/40 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Tutor Study Plan</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Adaptive Routine
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-2 font-['Outfit',sans-serif]">
              Personalized Recommendations for {safeProfile.name || "Student"}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Based on your specialization in <strong className="text-white">{safeProfile.role || enrolledCourse?.category || "Full Stack Development"}</strong> and recent study velocity, your AI pedagogical coach recommends the following targeted routine:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-100">Step 1: Conceptual Walkthrough</div>
                  <div className="text-slate-300 text-[11px]">{diagnostics.step1}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-100">Step 2: Checkpoint Assessment</div>
                  <div className="text-slate-300 text-[11px]">{diagnostics.step2}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onLaunchTutor(diagnostics.step1Query)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Tutor</span>
              </button>
              <button
                onClick={() => onLaunchAssessment(diagnostics.step2Topic)}
                className="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Take Assessment
              </button>
            </div>

            {onOpenCertificate && (
              <button
                onClick={onOpenCertificate}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-all ${
                  isEnrolledCourseCompleted
                    ? "bg-emerald-600/40 hover:bg-emerald-600/60 border-emerald-400/50 text-emerald-200 font-bold shadow-xs"
                    : "bg-white/10 hover:bg-white/20 border-white/15 text-slate-300"
                }`}
                title={isEnrolledCourseCompleted ? "Download Verified Completion Certificate" : `Requires 100% completion (currently ${enrolledProgress}%)`}
              >
                {isEnrolledCourseCompleted ? (
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{isEnrolledCourseCompleted ? "View Certificate (100%)" : `Certificate (${enrolledProgress}% / 100%)`}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course-Isolated Assignments & Historical Records for Logged-In Student */}
      {(() => {
        const courseAssignmentModules = getCourseAssignmentModules(enrolledCourse);
        const courseHistory = filterAssessmentsByCourse(assessmentHistory, enrolledCourse);

        return (
          <div className="bg-white rounded-2xl border border-indigo-100 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                    Course Assignments & Evaluations
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold">
                    Session Isolated
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Curated specifically for your enrolled course: <strong className="text-slate-800">{enrolledCourse.title}</strong>
                </p>
              </div>

              {onNavigateToAssessments && (
                <button
                  onClick={onNavigateToAssessments}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                >
                  <span>Open Full Assessments Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Course Assignment Modules */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Active Course Assignments ({courseAssignmentModules.length})</span>
                <span className="text-[11px] font-medium normal-case text-indigo-600">1-Click Launch</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {courseAssignmentModules.map((mod) => (
                  <div
                    key={mod.id}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">
                          {mod.difficulty}
                        </span>
                        <span className="text-slate-400 font-medium">~{mod.estimatedMinutes}m</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                        {mod.topic}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onLaunchAssessment(mod.topic)}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Take Assignment</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Assessment Record for this course */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Historical Evaluations for This Course ({courseHistory.length})</span>
                </div>
              </div>

              {courseHistory.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {courseHistory.slice(0, 3).map((item) => {
                    const pct = item.percentage ?? Math.round((item.score / (item.totalPoints || 100)) * 100);
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between"
                      >
                        <div className="space-y-0.5 truncate pr-2">
                          <div className="font-bold text-xs text-slate-900 truncate">
                            {item.topic}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.date} • {item.score}/{item.totalPoints} pts ({item.letterGrade})
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-md font-extrabold text-xs ${
                              pct >= 80
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : pct >= 60
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {pct}%
                          </span>
                          <button
                            onClick={() => onLaunchAssessment(item.topic)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                            title="Retake assignment"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  <p className="text-xs text-slate-500">
                    No historical assignments recorded yet for <strong>{enrolledCourse?.title || "your enrolled course"}</strong>. Click any assignment module above to test your skills!
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Courses Section with Enrolled Filter & Catalog Access */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                {courseViewMode === "enrolled" ? "Your Enrolled Course" : "Personalized Learning Curriculum"}
              </h2>
              {courseViewMode === "enrolled" && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                  Enrolled Track
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              {courseViewMode === "enrolled"
                ? `Dashboard filtered specifically to your active enrolled track: ${profile.role || enrolledCourse.category}.`
                : "Interactive coursework dynamically structured across all curriculum disciplines."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle: Enrolled Only vs All Courses */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs">
              <button
                id="btn-filter-enrolled"
                onClick={() => setCourseViewMode("enrolled")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  courseViewMode === "enrolled"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>My Enrolled Course (1)</span>
              </button>
              <button
                id="btn-filter-all-courses"
                onClick={() => setCourseViewMode("all")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  courseViewMode === "all"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Catalog ({courses.length})</span>
              </button>
            </div>

            <button
              id="btn-create-custom-course"
              onClick={onNavigateToCreator}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Generate AI Course</span>
            </button>
          </div>
        </div>

        {/* Category Filters (visible only when exploring all courses) */}
        {courseViewMode === "all" && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs animate-in fade-in duration-200">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Courses Grid */}
        <div className={`grid gap-6 ${displayedCourses.length === 1 ? "grid-cols-1 max-w-2xl" : "grid-cols-1 md:grid-cols-2"}`}>
          {displayedCourses.map((course) => {
            if (!course) return null;
            // Compute completed count for this course
            const cModules = Array.isArray(course.modules) ? course.modules : [];
            const totalLessons = cModules.reduce((acc, m) => acc + (Array.isArray(m?.lessons) ? m.lessons.length : 0), 0);
            const doneLessons = cModules.reduce(
              (acc, m) => acc + (Array.isArray(m?.lessons) ? m.lessons.filter((l) => safeCompletedLessons.has(l?.id)).length : 0),
              0
            );
            const progress = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;
            const isFinished = totalLessons > 0 && doneLessons === totalLessons;

            return (
              <div
                key={course.id}
                id={`course-card-${course.id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col overflow-hidden group"
              >
                {/* Header Banner */}
                <div className={`h-3 w-full bg-gradient-to-r ${course.bannerGradient || "from-indigo-600 via-blue-600 to-indigo-700"}`} />
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                          {course.category || "General"}
                        </span>
                        {course.id === enrolledCourse?.id && (
                          <span className="px-2 py-0.5 rounded-md font-extrabold bg-indigo-100 text-indigo-800 text-[10px]">
                            Enrolled
                          </span>
                        )}
                        {isFinished && (
                          <span className="px-2 py-0.5 rounded-md font-extrabold bg-emerald-100 text-emerald-800 text-[10px] flex items-center space-x-1">
                            <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
                            <span>100% Completed</span>
                          </span>
                        )}
                      </div>
                      <span className={`font-semibold ${
                        course.difficulty === "Advanced" ? "text-rose-600" : course.difficulty === "Intermediate" ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {course.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs text-slate-600 font-medium">
                      <span>Course Progress</span>
                      <span className={isFinished ? "text-emerald-600 font-bold" : ""}>
                        {progress}% ({doneLessons}/{totalLessons} lessons)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isFinished ? "bg-emerald-500" : "bg-indigo-600"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      id={`btn-open-course-${course.id}`}
                      onClick={() => onSelectCourse(course)}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                    >
                      <span>{progress > 0 ? "Continue Course" : "Enter Classroom"}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>

                    <button
                      id={`btn-quiz-${course.id}`}
                      onClick={() => onLaunchAssessment(course.title)}
                      className="p-2 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Generate AI Assessment for this course"
                    >
                      <FileCheck className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-tutor-course-${course.id}`}
                      onClick={() => onLaunchTutor(course.title)}
                      className="p-2 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Ask AI Tutor about this subject"
                    >
                      <BrainCircuit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
