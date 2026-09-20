import React, { useState } from "react";
import { 
  GraduationCap, 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Award, 
  Clock, 
  Zap, 
  BookOpen, 
  LifeBuoy, 
  PlusCircle, 
  Star, 
  ChevronRight, 
  LogIn, 
  UserPlus,
  Crown, 
  Lock, 
  RotateCcw,
  LayoutDashboard,
  UserCheck,
  Menu,
  X
} from "lucide-react";
import { Course, StudentProfile } from "../types";

interface LandingPageViewProps {
  courses: Course[];
  profile: StudentProfile;
  isLoggedIn: boolean;
  onEnterLMS: () => void;
  onLoginSuccess?: (user: Partial<StudentProfile>) => void;
  onOpenLoginModal: (mode?: "signin" | "signup") => void;
  onSelectCourse: (course: Course) => void;
  onLogout?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  courses,
  profile,
  isLoggedIn,
  onEnterLMS,
  onOpenLoginModal,
  onSelectCourse,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fullStackCourse = courses.find((c) => c.category === "Full Stack Development") || courses[0];

  const handleCourseClick = (course: Course) => {
    if (isLoggedIn) {
      onSelectCourse(course);
      onEnterLMS();
    } else {
      onOpenLoginModal("signin");
    }
  };

  const handleProtectedLMSClick = () => {
    if (isLoggedIn) {
      onEnterLMS();
    } else {
      onOpenLoginModal("signin");
    }
  };

  const handleScrollToCourses = () => {
    document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Floating Landing Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0" onClick={handleProtectedLMSClick} title="Virtual Learner ALMS">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                    Virtual Learner <span className="text-indigo-600">ALMS</span>
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase tracking-wider">
                    AI LMS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Adaptive Learning Management System</p>
              </div>
            </div>

            {/* Desktop Nav Links (Laptop & Large screens) */}
            <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-slate-600">
              <button 
                type="button"
                onClick={() => onOpenLoginModal("signin")} 
                className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <a href="#features" className="hover:text-indigo-600 transition-colors">Ecosystem</a>
              <a href="#curriculum" className="hover:text-indigo-600 transition-colors">Curriculum Tracks</a>
              <a href="#ai-tutor" className="hover:text-indigo-600 transition-colors">Socratic AI Tutor</a>
            </nav>

            {/* User Auth State / Enter Dashboard & Mobile Toggle */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
              {isLoggedIn ? (
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <div className="hidden md:flex flex-col items-end mr-1 text-right">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[120px] lg:max-w-[140px] flex items-center space-x-1">
                      <span>{profile.name}</span>
                      {profile.level >= 5 && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400 inline" />}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                      {profile.userRole || "Student"} Active
                    </span>
                  </div>

                  <button
                    id="btn-landing-to-dashboard"
                    onClick={onEnterLMS}
                    className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {onLogout && (
                    <button
                      id="btn-landing-logout"
                      onClick={onLogout}
                      className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
                      title="Log Out"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <button
                    id="btn-nav-signin"
                    type="button"
                    onClick={() => onOpenLoginModal("signin")}
                    className="px-2.5 sm:px-3 py-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 inline mr-1" />
                    <span>Sign In</span>
                  </button>
                  <button
                    id="btn-nav-create-account"
                    type="button"
                    onClick={() => onOpenLoginModal("signup")}
                    className="hidden sm:flex px-3.5 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account</span>
                  </button>
                </div>
              )}

              {/* Hamburger Button for Mobile and Tablet (Tab Screen) */}
              <button
                id="btn-landing-menu-toggle"
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Dropdown Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col space-y-1 text-sm font-semibold text-slate-700">
              <a 
                href="#features" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                Ecosystem Overview
              </a>
              <a 
                href="#curriculum" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                Curriculum Tracks & Courses
              </a>
              <a 
                href="#ai-tutor" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                Socratic AI Tutor
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onEnterLMS();
                  }}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Open Student Dashboard</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLoginModal("signin");
                    }}
                    className="w-full py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-4 h-4 text-indigo-600" />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLoginModal("signup");
                    }}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-20 border-b border-slate-200 bg-gradient-to-b from-white via-indigo-50/20 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Content (7 Columns) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200/80">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Next-Generation Adaptive Learning Management System</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-[Outfit,sans-serif]">
                Virtual Learner <span className="text-indigo-600">ALMS</span>
                <span className="block text-2xl sm:text-4xl text-slate-800 font-bold mt-2">
                  Personal 24/7 AI Tutor & Adaptive Engineering Curriculum
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
                Virtual Learner ALMS replaces traditional static coursework with an intelligent, multi-role LMS platform. Experience Socratic AI tutoring, automated rubric evaluations, instructor course authoring, and platform administration.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {isLoggedIn ? (
                  <>
                    <button
                      id="hero-btn-enter-dashboard"
                      type="button"
                      onClick={onEnterLMS}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-200 flex items-center space-x-2 transition-all cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>{profile.userRole === "admin" ? "Open Admin Dashboard" : profile.userRole === "instructor" ? "Open Instructor Studio" : "Open Student Dashboard"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      id="hero-btn-switch-account"
                      type="button"
                      onClick={() => onOpenLoginModal("signin")}
                      className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span>Switch Persona</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      id="hero-btn-create-account"
                      type="button"
                      onClick={() => onOpenLoginModal("signup")}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-200 flex items-center space-x-2 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      id="hero-btn-signin"
                      type="button"
                      onClick={() => onOpenLoginModal("signin")}
                      className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 text-indigo-600" />
                      <span>Sign In</span>
                    </button>
                  </>
                )}
                <button
                  id="hero-btn-explore-courses"
                  type="button"
                  onClick={handleScrollToCourses}
                  className="px-4 py-2.5 text-slate-600 hover:text-indigo-600 text-xs sm:text-sm font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Courses</span>
                </button>
              </div>

              {/* Trust & Key Stats */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-xl font-extrabold text-indigo-600 font-[Outfit,sans-serif]">100%</div>
                  <div className="text-[11px] text-slate-500 font-medium">Adaptive Mastery</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-xl font-extrabold text-blue-600 font-[Outfit,sans-serif]">4 Personas</div>
                  <div className="text-[11px] text-slate-500 font-medium">Socratic AI Tutors</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-xl font-extrabold text-emerald-600 font-[Outfit,sans-serif]">Instant</div>
                  <div className="text-[11px] text-slate-500 font-medium">Rubric Evaluations</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-xl font-extrabold text-amber-600 font-[Outfit,sans-serif]">3 Roles</div>
                  <div className="text-[11px] text-slate-500 font-medium">Student / Faculty / Admin</div>
                </div>
              </div>
            </div>

            {/* Right Hero: Classroom Interactive Preview & Adaptive Learning Showcase (5 Columns) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-slate-500 ml-2">Classroom Interactive Terminal</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Session
                  </span>
                </div>

                {/* Socratic Dialogue Card */}
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-indigo-900">Socrates AI Tutor</span>
                    <span className="text-[10px] text-indigo-500 font-medium">Guided Pedagogical Inquiry</span>
                  </div>
                  <p className="text-xs text-slate-700 italic">
                    "Before optimizing the cache layer, consider: what happens if the database connection pool is exhausted during a traffic spike?"
                  </p>
                </div>

                {/* Credential Honor Banner */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <div>
                      <div className="text-xs font-bold text-emerald-900">100% Flawless Mastery & Distinction</div>
                      <div className="text-[10px] text-emerald-700">Full Stack Development Track • Verified Credential</div>
                    </div>
                  </div>
                  <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>

                {/* Quick Role Sign-in Trigger CTA Card */}
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span>Multi-Role Access Available</span>
                    </div>
                    <span className="text-[10px] font-semibold text-indigo-300">Student • Instructor • Admin</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Access course modules, Socratic AI coaching, grading rubrics, or institutional administrative controls.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {isLoggedIn ? (
                      <>
                        <button
                          type="button"
                          onClick={onEnterLMS}
                          className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer col-span-1"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>Enter Dashboard</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenLoginModal("signin")}
                          className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer col-span-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Switch User</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenLoginModal("signup")}
                          className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Create Account</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenLoginModal("signin")}
                          className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Sign In</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6 Key Architectural Pillars */}
      <section id="features" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Comprehensive Learning Ecosystem</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Everything You Need to Master Engineering Disciplines
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Virtual Learner ALMS replaces fragmented study resources with an integrated, intelligent LMS tailored for deep retention and practical implementation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Multi-Persona AI Tutor with Speech
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose between Socrates (guided inquiry), Deep Dive (internals & trade-offs), Real-World Analogies, and Code Expert personas with text-to-speech audio synthesis.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-100">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Interactive Classroom & Code Checkpoints
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Study clean markdown lessons with key terminology, instant multiple-choice checkpoint validation, and 1-click contextual AI tutoring for any tricky concept.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Automated Assessments & AI Rubrics
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate custom knowledge evaluations or solve complex architectural prompts evaluated by Gemini with quantitative rubrics and actionable feedback.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-100">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Instant AI Course Generator & Studio
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Describe any topic and Virtual Learner ALMS generates a complete multi-module curriculum with interactive checkpoints in seconds.
              </p>
            </div>

            {/* Pillar 5 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-100">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Verified Certificates & Competency Matrix
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Earn authentic certificates of mastery with unique verification IDs, honors distinction seals, and track your granular proficiencies across modern tech stacks.
              </p>
            </div>

            {/* Pillar 6 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Admin Governance & Role Hierarchy
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unified RBAC security model supporting Students, Faculty Course Instructors, and System Administrators with granular audit logs and moderation tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Showcase Section */}
      <section id="curriculum" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Featured Technical Tracks</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                Industry-Aligned Curriculums
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                From Full Stack Web Architecture to Generative AI and Cloud Infrastructure.
              </p>
            </div>

            <button
              onClick={handleProtectedLMSClick}
              className="px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer w-fit"
            >
              <span>View All Courses in LMS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((c) => {
              const isGrandmasterTrack = c.category === "Full Stack Development";
              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                    isGrandmasterTrack
                      ? "border-indigo-300 shadow-md ring-1 ring-indigo-200"
                      : "border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                        {c.category}
                      </span>
                      {isGrandmasterTrack ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                          <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                          <span>100% Completed</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500">
                          {c.difficulty}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif] line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {c.tagline || c.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.durationHours} Hours</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons</span>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-600 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{c.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700">
                      {isGrandmasterTrack ? "Honors Distinction" : "Enrolled Cohort"}
                    </span>
                    <button
                      onClick={() => handleCourseClick(c)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Study Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Socratic Dialogue Showcase */}
      <section id="ai-tutor" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5 text-left">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                <span>24/7 Intelligent Mentorship</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                A Tutor That Adapts to How You Think
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Most AI tutors give generic answers. Virtual Learner ALMS allows you to switch pedagogies depending on your learning phase:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Socratic Inquirer</h4>
                    <p className="text-[11px] text-slate-500">Guides you to discover architectural solutions with strategic counter-questions.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Technical Deep Dive</h4>
                    <p className="text-[11px] text-slate-500">Explains runtime internals, memory allocations, and performance bottlenecks.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Real-World Analogies & Code Expert</h4>
                    <p className="text-[11px] text-slate-500">Translates abstract computer science into intuitive metaphors and production snippets.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-slate-300">Live Socratic Session (Active)</span>
                </div>
                <span className="text-[10px] text-slate-400">Virtual Learner AI Engine</span>
              </div>

              {/* Student Message */}
              <div className="bg-slate-800/80 p-3 rounded-xl text-slate-200 text-left">
                <span className="text-indigo-400 font-bold block mb-1">Scholar Hari Srinivas:</span>
                "Why should we avoid calling setState synchronously inside a high-frequency WebSocket message handler?"
              </div>

              {/* AI Socratic Response */}
              <div className="bg-indigo-950/60 border border-indigo-800/60 p-3.5 rounded-xl text-indigo-200 text-left space-y-2">
                <span className="text-emerald-400 font-bold block">Socrates AI:</span>
                <p>
                  "Great question. Think about the browser's render pipeline. When 100 messages arrive per second and each invokes setState, what happens to the React component tree and the browser's 16.6ms frame budget?"
                </p>
                <div className="pt-2 border-t border-indigo-900 text-[10px] text-slate-400 flex items-center space-x-2">
                  <span className="text-amber-400">💡 Hint:</span>
                  <span>Batching with requestAnimationFrame or micro-queues.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-14 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold border border-white/20">
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Virtual Learner ALMS Platform</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit',sans-serif]">
            Ready to Begin Your Adaptive Learning Journey?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Experience the full power of Virtual Learner ALMS. Sign in as Student, Instructor, or System Admin to access courses and intelligent tutoring.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="cta-btn-create-account"
              type="button"
              onClick={() => onOpenLoginModal("signup")}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-950 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="cta-btn-signin"
              type="button"
              onClick={() => onOpenLoginModal("signin")}
              className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Existing ID</span>
            </button>

            <button
              id="cta-btn-launch-lms"
              onClick={handleProtectedLMSClick}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs sm:text-sm font-medium rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Browse LMS Directly</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 font-['Outfit',sans-serif]">Virtual Learner ALMS</span>
              <span>© {new Date().getFullYear()} Virtual Learner ALMS. All rights reserved.</span>
            </div>

            <div className="flex items-center space-x-6 text-xs">
              <button 
                type="button"
                onClick={() => onOpenLoginModal("signin")} 
                className="hover:text-indigo-600 cursor-pointer"
              >
                Login / Credentials
              </button>
              <button onClick={handleProtectedLMSClick} className="hover:text-indigo-600 cursor-pointer">LMS Workspace</button>
              <a href="#features" className="hover:text-indigo-600">Features</a>
              <a href="#curriculum" className="hover:text-indigo-600">Curriculum</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
