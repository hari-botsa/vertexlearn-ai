import React, { useState } from "react";
import { 
  Course, 
  CourseModule, 
  Lesson, 
  StudentSubmission, 
  QuizItem, 
  AssessmentQuestion,
  UserRecord
} from "../types";
import { 
  BookOpen, 
  Plus, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  Award, 
  TrendingUp, 
  BarChart2, 
  Edit3, 
  Trash2, 
  Upload, 
  ExternalLink, 
  Eye, 
  Check, 
  X, 
  ChevronRight, 
  Search, 
  Filter, 
  Layers, 
  MessageSquare, 
  Send, 
  Save, 
  AlertCircle,
  HelpCircle,
  FileCheck,
  RefreshCw,
  GraduationCap
} from "lucide-react";

interface InstructorDashboardViewProps {
  courses?: Course[];
  submissions?: StudentSubmission[];
  quizzes?: QuizItem[];
  students?: UserRecord[];
  onSaveCourses: (courses: Course[]) => void;
  onSaveSubmissions: (submissions: StudentSubmission[]) => void;
  onSaveQuizzes: (quizzes: QuizItem[]) => void;
  onNavigateToCourse: (course: Course, lesson?: Lesson) => void;
}

export const InstructorDashboardView: React.FC<InstructorDashboardViewProps> = ({
  courses = [],
  submissions = [],
  quizzes = [],
  students = [],
  onSaveCourses,
  onSaveSubmissions,
  onSaveQuizzes,
  onNavigateToCourse
}) => {
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeSubmissions = Array.isArray(submissions) ? submissions : [];
  const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];
  const safeStudents = Array.isArray(students) ? students : [];

  // Sub-navigation tabs inside Instructor View
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "quizzes" | "summarizer" | "submissions" | "materials">("overview");

  // Filter & Search states
  const [submissionFilter, setSubmissionFilter] = useState<"all" | "needs_review" | "graded">("all");
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  // Review & Grading Modal state
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(85);
  const [reviewGrade, setReviewGrade] = useState<string>("B+");
  const [reviewFeedback, setReviewFeedback] = useState<string>("");

  // Create Course Modal state
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseTagline, setNewCourseTagline] = useState("");
  const [newCourseCategory, setNewCourseCategory] = useState("Full Stack & Web Architecture");
  const [newCourseDifficulty, setNewCourseDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [newCourseHours, setNewCourseHours] = useState(8);
  const [newCourseDescription, setNewCourseDescription] = useState("");

  // Add Module/Lesson Modal state
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [targetCourseId, setTargetCourseId] = useState<string>(safeCourses[0]?.id || "");
  const [targetModuleTitle, setTargetModuleTitle] = useState("New Curriculum Module");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState(20);
  const [newLessonSummary, setNewLessonSummary] = useState("");
  const [newLessonContent, setNewLessonContent] = useState("");

  // Upload Materials state
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialType, setMaterialType] = useState<"pdf" | "slides" | "code" | "notes">("notes");
  const [materialCourseId, setMaterialCourseId] = useState<string>(courses[0]?.id || "");
  const [materialContent, setMaterialContent] = useState("");
  const [uploadedMaterials, setUploadedMaterials] = useState<Array<{
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
    type: string;
    date: string;
    size: string;
  }>>([
    {
      id: "mat-1",
      title: "Distributed Architecture Reference Cheatsheet.pdf",
      courseId: "fullstack-core-101",
      courseTitle: "Modern Full Stack Web Architecture",
      type: "pdf",
      date: "2026-09-12",
      size: "2.4 MB"
    },
    {
      id: "mat-2",
      title: "ReAct Agents Implementation Boilerplate.ts",
      courseId: "course-ai-agent",
      courseTitle: "Autonomous AI Agents with Gemini 2.0",
      type: "code",
      date: "2026-09-14",
      size: "48 KB"
    }
  ]);
  const [materialSuccessNotice, setMaterialSuccessNotice] = useState(false);

  // AI Quiz Generator state
  const [aiQuizCourseTitle, setAiQuizCourseTitle] = useState(courses[0]?.title || "Full Stack Web Architecture");
  const [aiQuizTopic, setAiQuizTopic] = useState("Microservices & Distributed Caching");
  const [aiQuizDifficulty, setAiQuizDifficulty] = useState("Intermediate");
  const [aiQuizCount, setAiQuizCount] = useState(3);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [generatedQuizQuestions, setGeneratedQuizQuestions] = useState<AssessmentQuestion[] | null>(null);
  const [quizSavedNotice, setQuizSavedNotice] = useState(false);

  // AI Lesson Summarizer state
  const [summarizerLessonTitle, setSummarizerLessonTitle] = useState("Distributed Caching & Redis Integration");
  const [summarizerContent, setSummarizerContent] = useState(
    "In high throughput distributed applications, hitting the relational database for every read introduces severe I/O bottlenecks. Redis provides an in-memory key-value data store capable of sub-millisecond response times. However, introducing a cache layer brings cache invalidation complexity, cache stampede hazards, and dirty reads. Employing the Cache-Aside pattern paired with TTL jitter effectively mitigates stampedes while ensuring consistent state transitions."
  );
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<{
    executiveSummary: string;
    keyTakeaways: string[];
    discussionPrompts: string[];
    suggestedStudyMinutes: number;
  } | null>(null);

  // Stats calculation
  const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0);
  const totalLessons = courses.reduce((acc, c) => acc + c.modules.reduce((mAcc, m) => mAcc + m.lessons.length, 0), 0);
  const pendingSubmissions = submissions.filter(s => s.status === "needs_review").length;
  const avgScore = Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / (submissions.length || 1));

  // Handlers
  const handleOpenReview = (sub: StudentSubmission) => {
    setSelectedSubmission(sub);
    setReviewScore(sub.score);
    setReviewGrade(sub.letterGrade);
    setReviewFeedback(sub.instructorFeedback || "");
  };

  const handleSaveReview = () => {
    if (!selectedSubmission) return;
    const updated = submissions.map(s => {
      if (s.id === selectedSubmission.id) {
        return {
          ...s,
          score: reviewScore,
          percentage: reviewScore,
          letterGrade: reviewGrade,
          status: "graded" as const,
          instructorFeedback: reviewFeedback
        };
      }
      return s;
    });
    onSaveSubmissions(updated);
    setSelectedSubmission(null);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const newCourse: Course = {
      id: "course-" + Date.now(),
      title: newCourseTitle.trim(),
      tagline: newCourseTagline.trim() || `Master ${newCourseTitle.trim()} with structured instruction.`,
      description: newCourseDescription.trim() || "A comprehensive curriculum designed by faculty to accelerate conceptual mastery and production readiness.",
      category: newCourseCategory,
      difficulty: newCourseDifficulty,
      durationHours: Number(newCourseHours) || 8,
      enrollmentCount: 0,
      rating: 5.0,
      bannerGradient: "from-indigo-600 via-indigo-700 to-indigo-900",
      accentColor: "#4f46e5",
      prerequisites: ["Foundational computational literacy", "Logical problem solving"],
      learningOutcomes: [
        `Master the architectural principles of ${newCourseTitle.trim()}`,
        "Build resilient, production-ready prototypes",
        "Diagnose and optimize performance bottlenecks"
      ],
      modules: [
        {
          id: "mod-" + Date.now(),
          title: "Module 1: Foundations & Core Concepts",
          description: "Essential mechanics, core vocabulary, and theoretical principles.",
          lessons: [
            {
              id: "les-" + Date.now() + "-1",
              title: `Introduction to ${newCourseTitle.trim()}`,
              summary: "High-level overview and real-world significance.",
              durationMinutes: 20,
              keyTerms: ["Architecture", "Modularity", "State"],
              contentMarkdown: `### Welcome to ${newCourseTitle.trim()}

This curriculum establishes high-leverage mental models and technical rigor.

#### Core Pillars
- **Modularity**: Decouple components for independent testing.
- **Predictability**: Ensure deterministic outputs.
- **Observability**: Add structured telemetry early.

Explore each module thoroughly and test your understanding with assessments.`
            }
          ]
        }
      ]
    };

    onSaveCourses([newCourse, ...courses]);
    setIsCreateCourseOpen(false);
    setNewCourseTitle("");
    setNewCourseTagline("");
    setNewCourseDescription("");
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !targetCourseId) return;

    const updatedCourses = courses.map(c => {
      if (c.id === targetCourseId) {
        const existingModules = [...c.modules];
        let mod = existingModules[0];
        if (!mod) {
          mod = {
            id: "mod-" + Date.now(),
            title: targetModuleTitle,
            description: "Curriculum module",
            lessons: []
          };
          existingModules.push(mod);
        }

        const newLesson: Lesson = {
          id: "les-" + Date.now(),
          title: newLessonTitle.trim(),
          summary: newLessonSummary.trim() || "Instructor-provided lecture and study material.",
          durationMinutes: Number(newLessonDuration) || 15,
          contentMarkdown: newLessonContent.trim() || `### ${newLessonTitle.trim()}\n\nDetailed lesson content provided by course faculty.\n\nReview the concepts and complete the checkpoint.`
        };

        mod.lessons.push(newLesson);
        return { ...c, modules: existingModules };
      }
      return c;
    });

    onSaveCourses(updatedCourses);
    setIsAddLessonOpen(false);
    setNewLessonTitle("");
    setNewLessonSummary("");
    setNewLessonContent("");
  };

  const handleUploadMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim()) return;

    const targetCourse = courses.find(c => c.id === materialCourseId);
    const newMat = {
      id: "mat-" + Date.now(),
      title: materialTitle.trim(),
      courseId: materialCourseId,
      courseTitle: targetCourse?.title || "General Resource",
      type: materialType,
      date: new Date().toISOString().split("T")[0],
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`
    };

    setUploadedMaterials([newMat, ...uploadedMaterials]);
    setMaterialTitle("");
    setMaterialContent("");
    setMaterialSuccessNotice(true);
    setTimeout(() => setMaterialSuccessNotice(false), 3000);
  };

  const handleGenerateAiQuiz = async () => {
    setIsGeneratingQuiz(true);
    setQuizSavedNotice(false);
    try {
      const response = await fetch("/api/instructor/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle: aiQuizCourseTitle,
          lessonTopic: aiQuizTopic,
          questionCount: aiQuizCount,
          difficulty: aiQuizDifficulty
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.quiz && data.quiz.questions) {
          setGeneratedQuizQuestions(data.quiz.questions);
        }
      }
    } catch (err) {
      console.error("Failed to generate AI quiz", err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSaveGeneratedQuiz = () => {
    if (!generatedQuizQuestions || generatedQuizQuestions.length === 0) return;
    const targetCourse = courses.find(c => c.title === aiQuizCourseTitle) || courses[0];

    const newQuiz: QuizItem = {
      id: "quiz-" + Date.now(),
      title: `${aiQuizTopic} - Mastery Check`,
      courseId: targetCourse?.id || "course-default",
      courseTitle: targetCourse?.title || aiQuizCourseTitle,
      lessonTopic: aiQuizTopic,
      difficulty: aiQuizDifficulty,
      questionsCount: generatedQuizQuestions.length,
      createdAt: new Date().toISOString().split("T")[0],
      questions: generatedQuizQuestions
    };

    onSaveQuizzes([newQuiz, ...quizzes]);
    setQuizSavedNotice(true);
    setTimeout(() => setQuizSavedNotice(false), 3500);
  };

  const handleGenerateAiSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await fetch("/api/instructor/summarize-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: summarizerLessonTitle,
          lessonContent: summarizerContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.summary) {
          setGeneratedSummary(data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to summarize lesson", err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter(sub => {
    if (submissionFilter === "needs_review" && sub.status !== "needs_review") return false;
    if (submissionFilter === "graded" && sub.status !== "graded") return false;
    if (submissionSearch) {
      const q = submissionSearch.toLowerCase();
      return (
        sub.studentName.toLowerCase().includes(q) ||
        sub.courseTitle.toLowerCase().includes(q) ||
        sub.quizTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Instructor Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 lg:p-8 text-white border border-indigo-900/50 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Faculty & Instructor Portal</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Instructor Command Studio
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Design curricula, author modular lectures, generate AI quizzes, upload learning materials, and grade student submissions in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-instructor-create-course"
              onClick={() => setIsCreateCourseOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </button>
            <button
              id="btn-instructor-add-lesson"
              onClick={() => setIsAddLessonOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-sm font-semibold transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Add Module / Lesson</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{courses.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Courses</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalEnrolled}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{pendingSubmissions}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Grading</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{avgScore}%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Student Mark</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 sm:space-x-4 pb-px">
        {[
          { id: "overview", label: "Dashboard & Analytics", icon: BarChart2 },
          { id: "courses", label: "Course & Lesson Studio", icon: BookOpen },
          { id: "materials", label: "Learning Materials", icon: Upload },
          { id: "quizzes", label: "AI Quiz Builder", icon: Sparkles },
          { id: "summarizer", label: "AI Lesson Summarizer", icon: FileCheck },
          { id: "submissions", label: `Student Submissions (${submissions.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW & ANALYTICS */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Analytics Table */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span>Course Engagement & Performance Analytics</span>
                </h2>
                <span className="text-xs text-slate-500">Updated today</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                      <th className="pb-3">Course Title</th>
                      <th className="pb-3 text-center">Enrolled</th>
                      <th className="pb-3 text-center">Lessons</th>
                      <th className="pb-3 text-center">Est. Pass Rate</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map((course) => {
                      const lessonCount = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
                      return (
                        <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="font-semibold text-slate-900">{course.title}</div>
                            <div className="text-xs text-slate-500">{course.category} • {course.difficulty}</div>
                          </td>
                          <td className="py-3.5 text-center font-medium text-slate-700">
                            {course.enrollmentCount || 12}
                          </td>
                          <td className="py-3.5 text-center text-slate-600">
                            {lessonCount}
                          </td>
                          <td className="py-3.5 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              {course.rating ? `${Math.round(course.rating * 19)}%` : "92%"}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => onNavigateToCourse(course)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
                            >
                              <span>Enter Class</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions & AI Assist Panel */}
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-base mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>AI Instructional Assistant</span>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed mb-4">
                  Boost course completion rates using AI generation for diagnostic quizzes, chapter summaries, and targeted study materials.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg bg-white hover:bg-indigo-100/70 border border-indigo-200 text-xs font-semibold text-indigo-950 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Generate AI Quiz Questions</span>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                  <button
                    onClick={() => setActiveTab("summarizer")}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg bg-white hover:bg-indigo-100/70 border border-indigo-200 text-xs font-semibold text-indigo-950 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Synthesize Lesson Summary</span>
                    <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                  <button
                    onClick={() => setActiveTab("submissions")}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg bg-white hover:bg-indigo-100/70 border border-indigo-200 text-xs font-semibold text-indigo-950 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Review Pending Submissions ({pendingSubmissions})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                </div>
              </div>

              {/* Student Performance Pulse */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Enrolled Scholars Performance</span>
                </h3>
                <div className="space-y-3">
                  {students.slice(0, 3).map((std) => (
                    <div key={std.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <div className="font-semibold text-slate-800">{std.name}</div>
                        <div className="text-slate-500">{std.email}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                        {std.enrolledCoursesCount || 1} Courses
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. COURSE & LESSON STUDIO */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Curriculum & Course Studio</h2>
              <p className="text-xs text-slate-500">Create new courses, add modules, and curate lessons</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCreateCourseOpen(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Course</span>
              </button>
              <button
                onClick={() => setIsAddLessonOpen(true)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold flex items-center space-x-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Add Lesson</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider">
                      {course.category}
                    </span>
                    <span className="text-slate-500">{course.difficulty}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{course.title}</h3>
                  <p className="text-slate-600 text-xs line-clamp-2">{course.description}</p>
                  
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{course.modules.length} Modules</span>
                    <span>{course.modules.reduce((a, m) => a + m.lessons.length, 0)} Lessons</span>
                    <span>{course.durationHours}h Duration</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setTargetCourseId(course.id);
                      setIsAddLessonOpen(true);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Lesson</span>
                  </button>
                  <button
                    onClick={() => onNavigateToCourse(course)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
                  >
                    Preview Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. LEARNING MATERIALS UPLOADER */}
      {activeTab === "materials" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              <span>Upload Learning Material</span>
            </h2>
            <p className="text-xs text-slate-500">
              Provide students with lecture notes, downloadable code templates, slide decks, or reference guides.
            </p>

            {materialSuccessNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Material published and linked to course repository!</span>
              </div>
            )}

            <form onSubmit={handleUploadMaterial} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus Cheatsheet.pdf"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Course *</label>
                <select
                  value={materialCourseId}
                  onChange={(e) => setMaterialCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Format</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "pdf", label: "PDF" },
                    { id: "slides", label: "Slides" },
                    { id: "code", label: "Code" },
                    { id: "notes", label: "Notes" },
                  ].map((fmt) => (
                    <button
                      type="button"
                      key={fmt.id}
                      onClick={() => setMaterialType(fmt.id as any)}
                      className={`py-2 text-center rounded-lg border font-semibold ${
                        materialType === fmt.id
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Summary / Notes / Code Snippet</label>
                <textarea
                  rows={4}
                  placeholder="Optional reference notes or code instructions for students..."
                  value={materialContent}
                  onChange={(e) => setMaterialContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Publish to Student Classroom</span>
              </button>
            </form>
          </div>

          {/* Uploaded Materials Registry */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Active Course Materials Repository</h2>
            <div className="divide-y divide-slate-100">
              {uploadedMaterials.map((mat) => (
                <div key={mat.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                      {mat.type}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{mat.title}</div>
                      <div className="text-xs text-slate-500">{mat.courseTitle} • {mat.size} • Added {mat.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold">Available</span>
                    <button
                      onClick={() => alert(`Previewing material: ${mat.title}`)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. AI QUIZ BUILDER */}
      {activeTab === "quizzes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generator Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-base">
              <Sparkles className="w-5 h-5" />
              <span>AI Quiz Generator</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use Gemini AI to craft rigorous multiple-choice questions complete with distractor rationale, pedagogical explanations, and points.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course</label>
                <select
                  value={aiQuizCourseTitle}
                  onChange={(e) => setAiQuizCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lesson Topic / Concept *</label>
                <input
                  type="text"
                  value={aiQuizTopic}
                  onChange={(e) => setAiQuizTopic(e.target.value)}
                  placeholder="e.g. ACID Transactions and Connection Pooling"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={aiQuizDifficulty}
                    onChange={(e) => setAiQuizDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Question Count</label>
                  <select
                    value={aiQuizCount}
                    onChange={(e) => setAiQuizCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value={2}>2 Questions</option>
                    <option value={3}>3 Questions</option>
                    <option value={4}>4 Questions</option>
                    <option value={5}>5 Questions</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiQuiz}
                disabled={isGeneratingQuiz || !aiQuizTopic.trim()}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                {isGeneratingQuiz ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Quiz Questions</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Preview & Saving */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Quiz Questions Preview</h2>
                <p className="text-xs text-slate-500">Inspect generated answers and assign to your course curriculum</p>
              </div>

              {generatedQuizQuestions && generatedQuizQuestions.length > 0 && (
                <button
                  onClick={handleSaveGeneratedQuiz}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish Quiz</span>
                </button>
              )}
            </div>

            {quizSavedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Quiz successfully published to the course quizzes roster!</span>
              </div>
            )}

            {generatedQuizQuestions && generatedQuizQuestions.length > 0 ? (
              <div className="space-y-4">
                {generatedQuizQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-700">Question {idx + 1}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">{q.points || 25} Points</span>
                    </div>
                    <div className="font-medium text-slate-900 text-sm">{q.prompt}</div>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border font-medium flex items-center space-x-2 ${
                              oIdx === q.correctOptionIndex
                                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {oIdx === q.correctOptionIndex && (
                              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-800">Pedagogical Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 space-y-3">
                <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
                <div className="text-sm font-medium">No quiz questions generated yet.</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Select a course and topic on the left, then click "Generate Quiz Questions" to watch Gemini produce formatted questions instantly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. AI LESSON SUMMARIZER */}
      {activeTab === "summarizer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-base">
              <FileCheck className="w-5 h-5" />
              <span>Lesson Content Synthesizer</span>
            </div>
            <p className="text-xs text-slate-500">
              Paste or type lesson content to receive structured executive summaries, high-impact key takeaways, and in-class discussion prompts.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lesson Title</label>
                <input
                  type="text"
                  value={summarizerLessonTitle}
                  onChange={(e) => setSummarizerLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lesson Content / Lecture Transcript *</label>
                <textarea
                  rows={8}
                  value={summarizerContent}
                  onChange={(e) => setSummarizerContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-xs leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAiSummary}
                disabled={isGeneratingSummary || !summarizerContent.trim()}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                {isGeneratingSummary ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Summary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Summary with Gemini</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Summary & Pedagogical Insights</h2>

            {generatedSummary ? (
              <div className="space-y-5 text-xs">
                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 text-indigo-700">Executive Summary</h3>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                    {generatedSummary.executiveSummary}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 text-indigo-700">Essential Takeaways</h3>
                  <ul className="space-y-2">
                    {generatedSummary.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 text-indigo-700">Discussion Prompts for Students</h3>
                  <div className="space-y-2">
                    {generatedSummary.discussionPrompts.map((prompt, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-950 font-medium">
                        {prompt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 space-y-3">
                <FileCheck className="w-8 h-8 mx-auto text-slate-300" />
                <div className="text-sm font-medium">No summary generated yet.</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Review your lesson transcript on the left and tap "Generate Summary" to create structured takeaways and discussion starters.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. STUDENT SUBMISSIONS & MARKS */}
      {activeTab === "submissions" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Student Submissions & Marks</h2>
              <p className="text-xs text-slate-500">Grade quizzes, review open-ended answers, and deliver constructive rubric feedback</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or quiz..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
                />
              </div>

              <select
                value={submissionFilter}
                onChange={(e) => setSubmissionFilter(e.target.value as any)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
              >
                <option value="all">All Submissions</option>
                <option value="needs_review">Needs Review</option>
                <option value="graded">Graded</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course & Quiz</th>
                    <th className="py-3 px-4 text-center">Score / Grade</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{sub.studentName}</div>
                          <div className="text-xs text-slate-500">{sub.studentEmail}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 text-xs">{sub.quizTitle}</div>
                          <div className="text-[11px] text-slate-500">{sub.courseTitle}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-slate-900">{sub.score}%</span>
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700">
                            {sub.letterGrade}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            sub.status === "graded"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {sub.status === "graded" ? "Graded" : "Needs Review"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {sub.submittedAt}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenReview(sub)}
                            className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                          >
                            Review & Grade
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No submissions matching this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Review & Grade Submission */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Grade Student Submission</h3>
                <p className="text-xs text-slate-500">{selectedSubmission.studentName} • {selectedSubmission.quizTitle}</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedSubmission.openEndedResponse && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Student's Submitted Response</label>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono">
                  {selectedSubmission.openEndedResponse}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Score ({reviewScore}/100)</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={reviewScore}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setReviewScore(val);
                    if (val >= 90) setReviewGrade("A+");
                    else if (val >= 80) setReviewGrade("A-");
                    else if (val >= 70) setReviewGrade("B");
                    else if (val >= 60) setReviewGrade("C");
                    else setReviewGrade("F");
                  }}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Letter Grade</label>
                <select
                  value={reviewGrade}
                  onChange={(e) => setReviewGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-semibold"
                >
                  <option value="A+">A+ (Distinction)</option>
                  <option value="A">A (Excellent)</option>
                  <option value="A-">A- (Very Good)</option>
                  <option value="B+">B+ (Good)</option>
                  <option value="B">B (Satisfactory)</option>
                  <option value="C">C (Needs Improvement)</option>
                  <option value="F">F (Incomplete)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-slate-700">Instructor Constructive Feedback</label>
              <textarea
                rows={3}
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder="Add actionable feedback, strengths, and areas for improvement..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Save Mark & Publish Feedback</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Course */}
      {isCreateCourseOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Author New Course</h3>
              <button onClick={() => setIsCreateCourseOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus & Raft Protocols"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="Brief catchy elevator summary..."
                  value={newCourseTagline}
                  onChange={(e) => setNewCourseTagline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Full Stack & Web Architecture">Full Stack & Web Architecture</option>
                    <option value="Artificial Intelligence & LLMs">Artificial Intelligence & LLMs</option>
                    <option value="Cloud Infrastructure & DevOps">Cloud Infrastructure & DevOps</option>
                    <option value="Cybersecurity & Cryptography">Cybersecurity & Cryptography</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newCourseDifficulty}
                    onChange={(e) => setNewCourseDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Hours</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newCourseHours}
                  onChange={(e) => setNewCourseHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Overview Description</label>
                <textarea
                  rows={3}
                  placeholder="What will students learn in this curriculum?"
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCourseOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Module / Lesson */}
      {isAddLessonOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Add Module / Lesson</h3>
              <button onClick={() => setIsAddLessonOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLesson} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Course *</label>
                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Lock Management with Redis Redlock"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Module Title</label>
                  <input
                    type="text"
                    value={targetModuleTitle}
                    onChange={(e) => setTargetModuleTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Summary</label>
                <input
                  type="text"
                  placeholder="Brief 1-sentence abstract..."
                  value={newLessonSummary}
                  onChange={(e) => setNewLessonSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lecture Content (Markdown)</label>
                <textarea
                  rows={4}
                  placeholder="### Heading\n\nExplain the concept with examples and code..."
                  value={newLessonContent}
                  onChange={(e) => setNewLessonContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLessonOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
