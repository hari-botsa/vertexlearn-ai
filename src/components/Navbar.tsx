import React, { useState } from "react";
import { 
  GraduationCap, 
  Sparkles, 
  Flame, 
  BookOpen, 
  Brain, 
  CheckCircle2, 
  LifeBuoy, 
  PlusCircle, 
  Award,
  Zap,
  Layers,
  Menu,
  X,
  ChevronRight,
  Globe,
  LogIn,
  ShieldAlert,
  UserCheck,
  ChevronDown,
  LogOut
} from "lucide-react";
import { StudentProfile, UserRole } from "../types";

export type NavTab = "dashboard" | "classroom" | "tutor" | "assessments" | "support" | "creator" | "instructor" | "admin";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  profile: StudentProfile;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenUnstuck: () => void;
  onOpenCertificate: () => void;
  onOpenRoleModal: () => void;
  onNavigateToLanding: () => void;
  onOpenLoginModal: () => void;
  hasActiveLesson: boolean;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  earnedCertificatesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  currentRole,
  onSelectRole,
  onOpenUnstuck,
  onOpenCertificate,
  onOpenRoleModal,
  onNavigateToLanding,
  onOpenLoginModal,
  hasActiveLesson,
  isLoggedIn = false,
  onLogout,
  earnedCertificatesCount,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const xpPercent = Math.min(100, Math.round((profile.xp / profile.nextLevelXp) * 100));

  const handleTabSelect = (tab: NavTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleRoleSwitch = (role: UserRole) => {
    onSelectRole(role);
    setIsRoleDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (role === "instructor") {
      setActiveTab("instructor");
    } else if (role === "admin") {
      setActiveTab("admin");
    } else {
      setActiveTab("dashboard");
    }
  };

  // Dynamic nav items based on role
  const getNavItems = () => {
    if (currentRole === "instructor") {
      return [
        { id: "instructor" as NavTab, label: "Instructor Studio", shortLabel: "Studio", icon: GraduationCap, badge: "Faculty" },
        { id: "creator" as NavTab, label: "Course Creator", shortLabel: "New Course", icon: PlusCircle },
        { id: "support" as NavTab, label: "Help & Docs", shortLabel: "Support", icon: LifeBuoy },
        { id: "dashboard" as NavTab, label: "Student View", shortLabel: "Student", icon: BookOpen },
      ];
    }
    if (currentRole === "admin") {
      return [
        { id: "admin" as NavTab, label: "Admin Dashboard", shortLabel: "Admin Dashboard", icon: ShieldAlert, badge: "Master" },
        { id: "dashboard" as NavTab, label: "Student Dashboard", shortLabel: "Student View", icon: BookOpen },
        { id: "instructor" as NavTab, label: "Instructor Studio", shortLabel: "Faculty", icon: GraduationCap },
        { id: "support" as NavTab, label: "Platform Logs", shortLabel: "Logs", icon: LifeBuoy },
      ];
    }
    return [
      { id: "dashboard" as NavTab, label: "Dashboard", shortLabel: "Dashboard", icon: BookOpen },
      { id: "classroom" as NavTab, label: "Classroom", shortLabel: "Learn", icon: GraduationCap, hasBadge: hasActiveLesson },
      { id: "tutor" as NavTab, label: "AI Tutor", shortLabel: "Tutor", icon: Brain, badge: "AI" },
      { id: "assessments" as NavTab, label: "Assessments", shortLabel: "Assess", icon: CheckCircle2 },
      { id: "support" as NavTab, label: "Support Desk", shortLabel: "Support", icon: LifeBuoy },
      { id: "creator" as NavTab, label: "Create Course", shortLabel: "Create", icon: PlusCircle },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        {/* Top Banner / Status Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 sm:h-16">
            {/* Logo & Platform Name */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <div 
                id="alms-logo" 
                onClick={() => {
                  if (isLoggedIn) {
                    handleTabSelect("dashboard");
                  } else if (onNavigateToLanding) {
                    onNavigateToLanding();
                  }
                }}
                className="cursor-pointer flex items-center space-x-2 group"
                title={isLoggedIn ? "Go to Dashboard" : "Go to Virtual Learner ALMS Landing Page"}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                      Virtual Learner <span className="text-indigo-600">ALMS</span>
                    </span>
                    <span className="inline-flex items-center px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase tracking-wider">
                      AI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden md:block">Adaptive Learning Management System</p>
                </div>
              </div>
            </div>

            {/* Desktop Actions (md and up) */}
            <div className="hidden md:flex items-center space-x-1.5 lg:space-x-2.5 shrink-0">
              {/* Career Track Button */}
              {currentRole === "student" && (
                <button
                  id="btn-user-role"
                  onClick={onOpenRoleModal}
                  className="flex items-center space-x-1 lg:space-x-1.5 px-2 lg:px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  title="View your specialization track & competencies"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="hidden xl:inline text-blue-600 font-medium">Track:</span>
                  <span className="font-bold text-blue-900 max-w-[80px] sm:max-w-[100px] lg:max-w-[130px] truncate">{profile.role || "Full Stack Development"}</span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold ml-0.5 shrink-0">100%</span>
                </button>
              )}

              {/* Streak Counter (Only for Student) */}
              {currentRole === "student" && (
                <div 
                  id="streak-indicator"
                  className="flex items-center space-x-1 px-2 lg:px-2.5 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-amber-800 text-xs font-semibold shadow-xs shrink-0"
                  title={`${profile.streakDays}-day learning streak! Keep studying daily.`}
                >
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
                  <span>{profile.streakDays}d</span>
                  <span className="hidden xl:inline">Streak</span>
                </div>
              )}

              {/* Level & XP Progress (Only for Student) */}
              {currentRole === "student" && (
                <div 
                  id="level-xp-indicator"
                  className="hidden xl:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200 text-xs text-slate-700 shrink-0"
                >
                  <div className="flex items-center space-x-1 font-bold text-indigo-700">
                    <Zap className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                    <span>Lvl {profile.level}</span>
                  </div>
                  <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">{profile.xp} XP</span>
                </div>
              )}

              {/* Quick "Get Unstuck" Button */}
              {currentRole === "student" && (
                <button
                  id="btn-get-unstuck"
                  onClick={onOpenUnstuck}
                  className="flex items-center space-x-1 lg:space-x-1.5 px-2 lg:px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">Get Unstuck</span>
                  <span className="inline lg:hidden">Unstuck</span>
                </button>
              )}

              {/* Certificate Preview */}
              {currentRole === "student" && (
                <button
                  id="btn-view-certificate"
                  onClick={onOpenCertificate}
                  className="flex items-center space-x-1 lg:space-x-1.5 px-2 lg:px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition-colors cursor-pointer relative shrink-0"
                  title="View Verified Certificates of Mastery"
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">Certificates</span>
                  <span className="inline lg:hidden">Certs</span>
                  {typeof earnedCertificatesCount === "number" && earnedCertificatesCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold leading-none">
                      {earnedCertificatesCount}
                    </span>
                  )}
                </button>
              )}

              {/* Landing Page Link - ONLY VISIBLE WHEN USER IS NOT LOGGED IN TO PREVENT DUPLICATE LOGIN */}
              {!isLoggedIn && (
                <button
                  id="btn-nav-landing"
                  onClick={onNavigateToLanding}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                  title="View Public Landing Page"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden xl:inline">Landing</span>
                </button>
              )}

              {/* Log out (When Logged In) OR Account / Login (When Logged Out) */}
              {isLoggedIn ? (
                <button
                  id="btn-nav-logout"
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                  title="Log out of your session and return to landing page"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Log out</span>
                </button>
              ) : (
                <button
                  id="btn-nav-login-modal"
                  onClick={onOpenLoginModal}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                  title="Switch Account / Sign In"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Account</span>
                </button>
              )}
            </div>

            {/* Mobile Header Controls (< md) */}
            <div className="flex md:hidden items-center space-x-1.5">
              {/* Mobile Streak */}
              <div 
                className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold"
                title={`${profile.streakDays}-day streak`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{profile.streakDays}d</span>
              </div>

              {/* Mobile Role / 100% Badge */}
              <button
                onClick={onOpenRoleModal}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold"
                title="View Profile Track"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1 rounded-full">100%</span>
              </button>

              {/* Hamburger Button */}
              <button
                id="btn-mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs Bar */}
          <nav className="hidden md:flex space-x-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`tab-${item.id}`}
                  onClick={() => handleTabSelect(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-800"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.hasBadge && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Drawer / Menu (Slides down when open) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            {/* Mobile Account Summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {profile.name?.charAt(0) || "U"}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">{profile.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{currentRole} Account • {profile.role}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenLoginModal();
                }}
                className="px-2.5 py-1 bg-white border border-slate-200 text-indigo-600 rounded-lg text-[11px] font-bold hover:bg-indigo-50 transition-colors"
              >
                Switch
              </button>
            </div>

            {/* Student Info Card (Only when student) */}
            {currentRole === "student" && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{profile.name}</div>
                    <div className="text-xs text-indigo-600 font-medium">Track: {profile.role}</div>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <span>100% Mastery</span>
                  </div>
                </div>

                {/* Mobile Level & XP */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-indigo-700">Level {profile.level} Master</span>
                    <span>{profile.xp} / {profile.nextLevelXp} XP (100%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${xpPercent}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Action Buttons (Student only) */}
            {currentRole === "student" && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenUnstuck();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Get Unstuck</span>
                </button>

                <button
                  onClick={() => {
                    onOpenCertificate();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Certificates</span>
                  </div>
                  {typeof earnedCertificatesCount === "number" && earnedCertificatesCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                      {earnedCertificatesCount} Earned
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* All Tabs List */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
                {currentRole === "instructor" ? "Instructor Actions" : currentRole === "admin" ? "Admin Controls" : "Student Navigation"}
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? "text-white/80" : "text-slate-400"}`} />
                  </button>
                );
              })}
            </div>

            {/* Mobile Landing Page & Account / Log out */}
            <div className={`grid ${!isLoggedIn ? "grid-cols-2" : "grid-cols-1"} gap-2 pt-2 border-t border-slate-100`}>
              {!isLoggedIn && (
                <button
                  onClick={() => {
                    onNavigateToLanding();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Landing Page</span>
                </button>
              )}
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Log out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenLoginModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Switch User</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Persistent on phones, md:hidden) */}
      <nav 
        id="mobile-bottom-nav" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        {currentRole === "instructor" ? (
          <>
            <button
              onClick={() => handleTabSelect("instructor")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                activeTab === "instructor" ? "text-purple-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-5 h-5 mb-0.5" />
              <span>Studio</span>
            </button>
            <button
              onClick={() => handleTabSelect("creator")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                activeTab === "creator" ? "text-purple-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <PlusCircle className="w-5 h-5 mb-0.5" />
              <span>Create</span>
            </button>
            <button
              onClick={() => handleTabSelect("dashboard")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                activeTab === "dashboard" ? "text-purple-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-5 h-5 mb-0.5" />
              <span>Preview</span>
            </button>
          </>
        ) : currentRole === "admin" ? (
          <>
            <button
              onClick={() => handleTabSelect("admin")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                activeTab === "admin" ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ShieldAlert className="w-5 h-5 mb-0.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => handleTabSelect("instructor")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                activeTab === "instructor" ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-5 h-5 mb-0.5" />
              <span>Faculty</span>
            </button>
            <button
              onClick={() => handleTabSelect("dashboard")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                activeTab === "dashboard" ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-5 h-5 mb-0.5" />
              <span>Student View</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleTabSelect("dashboard")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                activeTab === "dashboard" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-5 h-5 mb-0.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => handleTabSelect("classroom")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors relative ${
                activeTab === "classroom" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-5 h-5 mb-0.5" />
              <span>Classroom</span>
              {hasActiveLesson && (
                <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>
            <button
              onClick={() => handleTabSelect("tutor")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors relative ${
                activeTab === "tutor" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Brain className="w-5 h-5 mb-0.5" />
                <span className="absolute -top-1 -right-2 text-[8px] bg-indigo-600 text-white px-1 rounded-full font-bold">AI</span>
              </div>
              <span>Tutor</span>
            </button>
            <button
              onClick={() => handleTabSelect("assessments")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                activeTab === "assessments" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="w-5 h-5 mb-0.5" />
              <span>Assess</span>
            </button>
          </>
        )}

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            isMobileMenuOpen ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};

