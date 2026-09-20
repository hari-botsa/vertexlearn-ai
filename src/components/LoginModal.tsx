import React, { useState, useEffect } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Layers, 
  UserPlus,
  LogIn
} from "lucide-react";
import { StudentProfile, UserRole, UserRecord } from "../types";
import { DEFAULT_PROFILE, getStoredUsers, saveStoredUsers, getCompetenciesForTrack } from "../utils/storage";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Partial<StudentProfile>) => void;
  initialMode?: "signin" | "signup";
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = "signin",
}) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sign in / Sign up form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole>("student");
  const [role, setRole] = useState("Full Stack Development");
  const [rememberMe, setRememberMe] = useState(true);

  // Sync mode whenever initialMode or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = email.trim();

    if (mode === "signup") {
      // Validate Sign Up inputs
      if (!name.trim()) {
        setErrorMessage("Please enter your full name.");
        return;
      }

      if (!identifier) {
        setErrorMessage("Please enter your email address.");
        return;
      }

      if (!identifier.includes("@")) {
        setErrorMessage("Please enter a valid email address (e.g., student@example.com).");
        return;
      }

      if (!password.trim() || password.length < 4) {
        setErrorMessage("Password must be at least 4 characters long.");
        return;
      }

      setIsLoading(true);

      // Register or update user record in storage
      try {
        const existingUsers = getStoredUsers();
        const existingIndex = existingUsers.findIndex(
          (u) => u.email.toLowerCase() === identifier.toLowerCase()
        );

        const newUserRecord: UserRecord = {
          id: existingIndex >= 0 ? existingUsers[existingIndex].id : `usr-${Date.now()}`,
          name: name.trim(),
          email: identifier,
          role: selectedUserRole,
          title:
            selectedUserRole === "instructor"
              ? `Faculty of ${role}`
              : selectedUserRole === "admin"
              ? "Platform Administrator"
              : `Scholar • ${role}`,
          status: "active",
          enrolledCoursesCount: selectedUserRole === "student" ? 3 : 0,
          createdCoursesCount: selectedUserRole === "instructor" ? 1 : 0,
          joinedDate: new Date().toISOString().split("T")[0],
          lastActive: "Active now",
          avatarBg:
            selectedUserRole === "student"
              ? "from-indigo-600 to-indigo-800"
              : selectedUserRole === "instructor"
              ? "from-purple-600 to-indigo-800"
              : "from-emerald-600 to-teal-800",
        };

        if (existingIndex >= 0) {
          existingUsers[existingIndex] = { ...existingUsers[existingIndex], ...newUserRecord };
        } else {
          existingUsers.unshift(newUserRecord);
        }
        saveStoredUsers(existingUsers);
      } catch (err) {
        console.error("Failed to sync registered user to storage:", err);
      }

      // Successfully authenticate user
      const signupCompetencies = getCompetenciesForTrack(role);
      onLoginSuccess({
        name: name.trim(),
        email: identifier,
        role: role,
        userRole: selectedUserRole,
        title:
          selectedUserRole === "instructor"
            ? `Faculty of ${role}`
            : selectedUserRole === "admin"
            ? "Platform Administrator"
            : `Scholar • ${role}`,
        level: selectedUserRole === "admin" ? 10 : selectedUserRole === "instructor" ? 6 : 1,
        xp: selectedUserRole === "admin" ? 10000 : selectedUserRole === "instructor" ? 4000 : 250,
        nextLevelXp: 5000,
        streakDays: 1,
        completedLessonsCount: 0,
        studyMinutesThisWeek: 30,
        trackCompetencies: signupCompetencies,
      });

      setIsLoading(false);
      onClose();
      return;
    }

    // SIGN IN MODE
    const isAdminTarget = 
      selectedUserRole === "admin" || 
      identifier.toLowerCase() === "admin" || 
      identifier.toLowerCase().startsWith("admin@");

    if (!identifier) {
      setErrorMessage("Please enter your email or username.");
      return;
    }

    if (!isAdminTarget && !identifier.includes("@") && identifier !== "student" && identifier !== "instructor") {
      setErrorMessage("Please enter a valid email address (e.g., student@alms.edu).");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    // Check Admin Password: Must be admin123 (or admin)
    if (isAdminTarget) {
      const normalizedPass = password.trim().toLowerCase();
      if (normalizedPass !== "admin123" && normalizedPass !== "admin 123" && normalizedPass !== "admin") {
        setErrorMessage("Invalid credentials for Admin. Password is: admin123");
        return;
      }
    }

    setIsLoading(true);

    if (isAdminTarget) {
      onLoginSuccess({
        name: "Platform Administrator",
        email: identifier.includes("@") ? identifier : "admin@alms.edu",
        userRole: "admin",
        role: "Platform Governance",
        title: "Super Admin",
        level: 10,
        xp: 15000,
        streakDays: 30,
      });
    } else if (identifier.toLowerCase().includes("hari") || identifier.toLowerCase().includes("student")) {
      const studentComp = getCompetenciesForTrack(DEFAULT_PROFILE.role);
      onLoginSuccess({
        ...DEFAULT_PROFILE,
        name: name.trim() || DEFAULT_PROFILE.name,
        email: identifier.includes("@") ? identifier : DEFAULT_PROFILE.email,
        userRole: "student",
        trackCompetencies: studentComp,
      });
    } else if (identifier.toLowerCase().includes("instructor") || identifier.toLowerCase().includes("rostova") || identifier.toLowerCase().includes("prof")) {
      onLoginSuccess({
        name: "Dr. Elena Rostova",
        email: identifier.includes("@") ? identifier : "instructor@alms.edu",
        userRole: "instructor",
        role: "AI & Distributed Systems",
        title: "Faculty Lead",
        level: 8,
        xp: 9400,
        streakDays: 14,
      });
    } else {
      // Look up registered user if exists
      const stored = getStoredUsers().find(
        (u) => u.email.toLowerCase() === identifier.toLowerCase()
      );

      const derivedName = stored
        ? stored.name
        : identifier.includes("@") 
        ? identifier.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : identifier.replace(/\b\w/g, (c) => c.toUpperCase());

      const userTrack = stored?.title?.includes("•")
        ? stored.title.split("•")[1].trim()
        : (stored as any)?.track || "Full Stack Development";

      const competencies = getCompetenciesForTrack(userTrack);

      onLoginSuccess({
        name: derivedName || "Platform User",
        email: identifier.includes("@") ? identifier : `${identifier}@alms.edu`,
        userRole: stored ? stored.role : selectedUserRole,
        role: stored?.role === "instructor" ? "Instructor Studio" : stored?.role === "admin" ? "System Admin" : userTrack,
        title: stored?.title || (selectedUserRole === "instructor" ? "Instructor" : `Scholar • ${userTrack}`),
        level: stored?.role === "admin" ? 10 : stored?.role === "instructor" ? 6 : 2,
        xp: stored?.role === "admin" ? 15000 : 1450,
        streakDays: 4,
        trackCompetencies: competencies,
      });
    }

    setIsLoading(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-200">
              Virtual Learner ALMS Authentication
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-['Outfit',sans-serif]">
            {mode === "signin" ? "Sign In to Your Account" : "Create Your Account"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {mode === "signin"
              ? "Enter your credentials to access your courses, personal AI tutor, and dashboard."
              : "Register to access 24/7 AI tutoring, adaptive curriculum tracks, and certificates."}
          </p>

          {/* Mode Switch Tabs: Sign In vs Create Account */}
          <div className="flex items-center mt-4 p-1 bg-white/10 rounded-xl">
            <button
              id="tab-modal-signin"
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                mode === "signin"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              id="tab-modal-signup"
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start space-x-2 animate-in fade-in">
              <span className="font-bold shrink-0">Error:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Clean Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-150">
            {/* Role Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  {mode === "signup" ? "Select Account Role" : "Workspace Role"}
                </label>
                <span className="text-[11px] text-slate-500">
                  {selectedUserRole === "student" ? "Learn & AI Tutor" : selectedUserRole === "instructor" ? "Course Studio & Rubrics" : "Platform Governance"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserRole("student")}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    selectedUserRole === "student"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold ring-2 ring-indigo-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>👨‍🎓</span>
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserRole("instructor")}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    selectedUserRole === "instructor"
                      ? "bg-purple-50 border-purple-500 text-purple-700 font-bold ring-2 ring-purple-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>👨‍🏫</span>
                  <span>Instructor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserRole("admin")}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    selectedUserRole === "admin"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold ring-2 ring-emerald-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>🛡️</span>
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Full Name (Sign Up only) */}
            {mode === "signup" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input-signup-fullname"
                    type="text"
                    required
                    placeholder="e.g. Hari Srinivas"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {mode === "signup" ? "Email Address" : "Email or Username"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input-auth-email"
                  type={mode === "signup" ? "email" : "text"}
                  required
                  placeholder={mode === "signup" ? "name@example.com" : "student@alms.edu or admin"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Specialization Track (Sign Up only) */}
            {mode === "signup" && selectedUserRole === "student" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Enrolled Specialization Track</label>
                  <span className="text-[10px] text-indigo-600 font-semibold">Course on your dashboard</span>
                </div>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    id="select-signup-track"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
                  >
                    <option value="Full Stack Development">Modern Full-Stack Development (React 19, Node.js)</option>
                    <option value="Cloud-Native DevOps">Cloud-Native DevOps & Distributed Systems</option>
                    <option value="Artificial Intelligence">Architecting Generative AI & LLM Systems</option>
                    <option value="Machine Learning">Deep Learning & Transformer Foundations</option>
                  </select>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                {mode === "signin" && selectedUserRole === "admin" && (
                  <span className="text-[11px] text-slate-400">
                    Admin pass: <strong className="text-slate-600">admin123</strong>
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input-auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={mode === "signup" ? "Create a secure password (min 4 chars)" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "signin" && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember this session</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="btn-auth-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{mode === "signup" ? "Creating Your Account..." : "Authenticating..."}</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === "signup"
                      ? selectedUserRole === "instructor"
                        ? "Create Instructor Account & Enter Studio"
                        : selectedUserRole === "admin"
                        ? "Create Administrator Account"
                        : "Create Account & Start Learning"
                      : "Sign In to Virtual Learner"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switch Footnote */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {mode === "signup" ? (
              <div className="space-y-1">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMessage(null);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Sign In here
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <span>Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMessage(null);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Create your account
                </button>
              </div>
            )}
          </div>

          {/* Trust Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center space-x-2 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure SSL Session • AI Evaluated & Authenticated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
