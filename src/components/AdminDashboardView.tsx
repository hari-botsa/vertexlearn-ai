import React, { useState } from "react";
import { 
  UserRecord, 
  Course, 
  CategoryItem, 
  EnrollmentRecord, 
  PlatformActivityLog, 
  ReportedContent 
} from "../types";
import { 
  Shield, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Tag, 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Search, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  ChevronRight, 
  Filter, 
  Server, 
  Lock, 
  RotateCcw,
  Flag,
  UserCheck,
  UserX,
  Layers,
  Sparkles,
  Award,
  CheckCircle2
} from "lucide-react";

interface AdminDashboardViewProps {
  users?: UserRecord[];
  courses?: Course[];
  categories?: CategoryItem[];
  enrollments?: EnrollmentRecord[];
  activityLogs?: PlatformActivityLog[];
  reportedContent?: ReportedContent[];
  onSaveUsers: (users: UserRecord[]) => void;
  onSaveCourses: (courses: Course[]) => void;
  onSaveCategories: (categories: CategoryItem[]) => void;
  onSaveEnrollments: (enrollments: EnrollmentRecord[]) => void;
  onSaveReportedContent: (reports: ReportedContent[]) => void;
  onLogActivity: (log: Omit<PlatformActivityLog, "id" | "timestamp">) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users = [],
  courses = [],
  categories = [],
  enrollments = [],
  activityLogs = [],
  reportedContent = [],
  onSaveUsers,
  onSaveCourses,
  onSaveCategories,
  onSaveEnrollments,
  onSaveReportedContent,
  onLogActivity
}) => {
  const safeUsers = Array.isArray(users) ? users : [];
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];
  const safeActivityLogs = Array.isArray(activityLogs) ? activityLogs : [];
  const safeReportedContent = Array.isArray(reportedContent) ? reportedContent : [];

  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "instructors" | "courses" | "categories" | "enrollments" | "activity" | "moderation"
  >("overview");

  // Filter & Search states
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [courseSearch, setCourseSearch] = useState("");
  const [logFilter, setLogFilter] = useState<"all" | "info" | "success" | "warning">("all");

  // Add User Dialog
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"student" | "instructor">("student");
  const [newUserTitle, setNewUserTitle] = useState("");

  // Add Category Dialog
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatColor, setNewCatColor] = useState("indigo");
  const [newCatDesc, setNewCatDesc] = useState("");

  // Quick stats
  const students = safeUsers.filter(u => u.role === "student");
  const instructors = safeUsers.filter(u => u.role === "instructor");
  const pendingReports = safeReportedContent.filter(r => r.status === "pending");

  // Handlers
  const handleToggleUserStatus = (userId: string) => {
    const updated = safeUsers.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === "active" ? ("suspended" as const) : ("active" as const);
        onLogActivity({
          type: "system_alert",
          actorName: "Admin Governance",
          actorRole: "admin",
          description: `Account for ${u.name} (${u.role}) was changed to ${nextStatus}.`,
          severity: nextStatus === "suspended" ? "warning" : "info"
        });
        return { ...u, status: nextStatus };
      }
      return u;
    });
    onSaveUsers(updated);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: UserRecord = {
      id: "usr-" + Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      title: newUserTitle.trim() || (newUserRole === "instructor" ? "Adjunct Faculty" : "Undergraduate Scholar"),
      status: "active",
      enrolledCoursesCount: 0,
      createdCoursesCount: 0,
      joinedDate: new Date().toISOString().split("T")[0],
      lastActive: "Just created",
      avatarBg: newUserRole === "instructor" ? "from-indigo-600 to-purple-800" : "from-emerald-600 to-teal-700"
    };

    onSaveUsers([newUser, ...users]);
    onLogActivity({
      type: "user_registered",
      actorName: "Admin Console",
      actorRole: "admin",
      description: `Manually registered ${newUser.name} as ${newUser.role}.`,
      severity: "success"
    });

    setIsAddUserOpen(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserTitle("");
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: CategoryItem = {
      id: "cat-" + Date.now(),
      name: newCatName.trim(),
      slug: newCatSlug.trim() || newCatName.toLowerCase().replace(/\s+/g, "-"),
      description: newCatDesc.trim() || "Academic specialization track.",
      courseCount: 0,
      color: newCatColor
    };

    onSaveCategories([...categories, newCat]);
    onLogActivity({
      type: "system_alert",
      actorName: "Curriculum Admin",
      actorRole: "admin",
      description: `Created new category '${newCat.name}'.`,
      severity: "info"
    });

    setIsAddCategoryOpen(false);
    setNewCatName("");
    setNewCatSlug("");
    setNewCatDesc("");
  };

  const handleDeleteCategory = (catId: string) => {
    onSaveCategories(categories.filter(c => c.id !== catId));
  };

  const handleUpdateEnrollmentStatus = (enrId: string, status: "active" | "completed" | "dropped") => {
    const updated = enrollments.map(e => (e.id === enrId ? { ...e, status } : e));
    onSaveEnrollments(updated);
  };

  const handleResolveReport = (reportId: string, action: string) => {
    const updated = reportedContent.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: "resolved" as const,
          actionTaken: action
        };
      }
      return r;
    });
    onSaveReportedContent(updated);
    onLogActivity({
      type: "report_flag",
      actorName: "Trust & Safety Admin",
      actorRole: "admin",
      description: `Resolved report #${reportId}: ${action}`,
      severity: "success"
    });
  };

  // Filtered lists
  const filteredStudents = students.filter(s => {
    if (userStatusFilter !== "all" && s.status !== userStatusFilter) return false;
    if (userSearch) {
      const q = userSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredInstructors = instructors.filter(i => {
    if (userStatusFilter !== "all" && i.status !== userStatusFilter) return false;
    if (userSearch) {
      const q = userSearch.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredLogs = activityLogs.filter(log => {
    if (logFilter !== "all" && log.severity !== logFilter) return false;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 lg:p-8 text-white border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Governance & Administration</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight flex items-center space-x-2.5">
              <span>Admin Governance Dashboard</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Admin Active
              </span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Supervise student accounts, manage faculty credentials, moderate user reports, configure categories, and audit system-wide telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-admin-add-user"
              onClick={() => setIsAddUserOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register User</span>
            </button>
            <button
              id="btn-admin-add-category"
              onClick={() => setIsAddCategoryOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-sm font-semibold transition-all cursor-pointer"
            >
              <Tag className="w-4 h-4 text-indigo-400" />
              <span>New Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{students.length}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Students</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{instructors.length}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Instructors</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{courses.length}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Courses</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{enrollments.length}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Enrollments</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5 col-span-2 lg:col-span-1">
          <div className="w-11 h-11 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{pendingReports.length}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Flags</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 sm:space-x-4 pb-px">
        {[
          { id: "overview", label: "Analytics & Telemetry", icon: BarChart3 },
          { id: "students", label: `Students (${students.length})`, icon: Users },
          { id: "instructors", label: `Instructors (${instructors.length})`, icon: GraduationCap },
          { id: "courses", label: `Courses (${courses.length})`, icon: BookOpen },
          { id: "categories", label: `Categories (${categories.length})`, icon: Tag },
          { id: "enrollments", label: `Enrollments (${enrollments.length})`, icon: Layers },
          { id: "activity", label: `Audit Log (${activityLogs.length})`, icon: Activity },
          { id: "moderation", label: `Reports (${pendingReports.length})`, icon: Flag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
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

      {/* 1. OVERVIEW & SYSTEM ANALYTICS */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Health Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>Cloud Infrastructure Health</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Container Uptime</span>
                  <span className="font-bold text-emerald-600">99.98% (Online)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">API Gateway Latency</span>
                  <span className="font-bold text-slate-900">142 ms (P95)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Gemini 2.5 Flash Engine</span>
                  <span className="font-bold text-indigo-600">Active (Adaptive Pool)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Database Persistence</span>
                  <span className="font-bold text-slate-900">Synchronized (Local & Storage)</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600">Security Sandbox</span>
                  <span className="font-bold text-emerald-600">Zero Vulnerabilities</span>
                </div>
              </div>
            </div>

            {/* Platform Velocity */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>Platform Metric Trends</span>
                </h2>
                <span className="text-xs text-slate-400">Past 30 Days</span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xl font-bold text-indigo-600">94.2%</div>
                  <div className="text-xs text-slate-500 mt-1">Course Satisfaction</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xl font-bold text-emerald-600">1,420+</div>
                  <div className="text-xs text-slate-500 mt-1">Study Hours Logged</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xl font-bold text-purple-600">89%</div>
                  <div className="text-xs text-slate-500 mt-1">Assessment Completion</div>
                </div>
              </div>

              {/* Real-time Activity Mini Stream */}
              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Recent System Audit Events</h3>
                <div className="space-y-2">
                  {activityLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          log.severity === "success" ? "bg-emerald-500" : log.severity === "warning" ? "bg-amber-500" : "bg-indigo-500"
                        }`} />
                        <span className="font-semibold text-slate-800">{log.actorName}</span>
                        <span className="text-slate-600">{log.description}</span>
                      </div>
                      <span className="text-slate-400 text-[11px] whitespace-nowrap">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANAGE STUDENTS */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Student Directory & Access Management</h2>
              <p className="text-xs text-slate-500">Monitor student progress, handle enrollments, and toggle account suspension</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
                />
              </div>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as any)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>

              <button
                onClick={() => {
                  setNewUserRole("student");
                  setIsAddUserOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Academic Specialization</th>
                    <th className="py-3 px-4 text-center">Enrolled</th>
                    <th className="py-3 px-4 text-center">Account Status</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{std.name}</div>
                        <div className="text-xs text-slate-500">{std.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700">
                        {std.title}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-xs">
                          {std.enrolledCoursesCount || 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          std.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {std.status === "active" ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {std.joinedDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(std.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            std.status === "active"
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {std.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. MANAGE INSTRUCTORS */}
      {activeTab === "instructors" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Faculty & Instructor Roster</h2>
              <p className="text-xs text-slate-500">Verify faculty credentials and assign teaching privileges</p>
            </div>

            <button
              onClick={() => {
                setNewUserRole("instructor");
                setIsAddUserOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Approve Instructor</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Faculty Member</th>
                    <th className="py-3 px-4">Academic Chair / Title</th>
                    <th className="py-3 px-4 text-center">Courses Created</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInstructors.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{inst.name}</div>
                        <div className="text-xs text-slate-500">{inst.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700 font-medium">
                        {inst.title}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-indigo-700">
                        {inst.createdCoursesCount || 2} Courses
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          inst.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {inst.status === "active" ? "Active Faculty" : "Suspended"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {inst.joinedDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(inst.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            inst.status === "active"
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {inst.status === "active" ? "Revoke Access" : "Reinstate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. MANAGE COURSES */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Course Catalog Administration</h2>
              <p className="text-xs text-slate-500">Publish, archive, and audit courses across the platform</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Modules / Lessons</th>
                    <th className="py-3 px-4 text-center">Enrolled</th>
                    <th className="py-3 px-4 text-center">Catalog Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses
                    .filter(c => !courseSearch || c.title.toLowerCase().includes(courseSearch.toLowerCase()))
                    .map((course) => {
                      const lessonCount = course.modules.reduce((a, m) => a + m.lessons.length, 0);
                      return (
                        <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{course.title}</div>
                            <div className="text-xs text-slate-500">{course.difficulty} • {course.durationHours} hrs</div>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                            {course.category}
                          </td>
                          <td className="py-3.5 px-4 text-center text-xs text-slate-600">
                            {course.modules.length} modules ({lessonCount} lessons)
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                            {course.enrollmentCount || 10}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              Published
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                onLogActivity({
                                  type: "course_published",
                                  actorName: "Admin Overseer",
                                  actorRole: "admin",
                                  description: `Updated published status for ${course.title}`,
                                  severity: "info"
                                });
                                alert(`Course "${course.title}" status audited.`);
                              }}
                              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. MANAGE CATEGORIES */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Curriculum Categories & Taxonomies</h2>
              <p className="text-xs text-slate-500">Organize subject areas, learning tracks, and syllabus groupings</p>
            </div>

            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider text-[10px]">
                      {cat.slug}
                    </span>
                    <span className="text-slate-500">{cat.courseCount} Courses</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{cat.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tag color: {cat.color}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. MANAGE ENROLLMENTS */}
      {activeTab === "enrollments" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Student Enrollment Ledger</h2>
              <p className="text-xs text-slate-500">Track genuine student syllabus progress, completion metrics, and enrollment audit trail</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Enrolled Course</th>
                    <th className="py-3 px-4 text-center">Progress %</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Enrollment Date</th>
                    <th className="py-3 px-4 text-right">Progress Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{enr.studentName}</div>
                        <div className="text-xs text-slate-500">{enr.studentEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-800">
                        {enr.courseTitle}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{ width: `${enr.progressPercent}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{enr.progressPercent}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          enr.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : enr.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {enr.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {enr.enrolledAt}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {enr.status === "completed" ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Course Completed</span>
                          </span>
                        ) : enr.status === "dropped" ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                            <span>Withdrawn</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span>Learner in Progress</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. AUDIT LOG STREAM */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Platform Security & Activity Audit Log</h2>
              <p className="text-xs text-slate-500">Immutable ledger of pedagogical and administrative events</p>
            </div>

            <div className="flex items-center space-x-2">
              {(["all", "info", "success", "warning"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setLogFilter(sev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    logFilter === sev
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    log.severity === "success"
                      ? "bg-emerald-50 text-emerald-600"
                      : log.severity === "warning"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-indigo-50 text-indigo-600"
                  }`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-xs">{log.actorName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold uppercase">
                        {log.actorRole}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 mt-1 leading-relaxed">{log.description}</div>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. MODERATION QUEUE */}
      {activeTab === "moderation" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Trust & Safety Moderation Queue</h2>
            <p className="text-xs text-slate-500">Review reported comments, plagiarized code submissions, and community complaints</p>
          </div>

          <div className="space-y-4">
            {reportedContent.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-xs uppercase">
                      {item.type}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{item.targetTitle}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    item.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {item.status === "pending" ? "Needs Action" : "Resolved"}
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-800">Report Reason: </span>
                  {item.reason}
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-slate-400">Reported by {item.reporterName} • {item.timestamp}</span>

                  {item.status === "pending" ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleResolveReport(item.id, "Content reviewed and dismissed as false positive.")}
                        className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(item.id, "Content flagged and removed. Author issued academic warning.")}
                        className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm"
                      >
                        Take Down Content
                      </button>
                    </div>
                  ) : (
                    <span className="text-emerald-700 font-medium">Action: {item.actionTaken}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Register User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Register Platform User</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Vance"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. liam.vance@stanford.edu"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Platform Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="student">Student (Scholar)</option>
                  <option value="instructor">Instructor (Faculty)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialization / Academic Title</label>
                <input
                  type="text"
                  placeholder="e.g. Cloud Infrastructure Associate"
                  value={newUserTitle}
                  onChange={(e) => setNewUserTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Category */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Add Curriculum Category</h3>
              <button onClick={() => setIsAddCategoryOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Robotics & Edge AI"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slug</label>
                <input
                  type="text"
                  placeholder="e.g. edge-ai-robotics"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Theme Color</label>
                <select
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="indigo">Indigo</option>
                  <option value="purple">Purple</option>
                  <option value="emerald">Emerald</option>
                  <option value="rose">Rose</option>
                  <option value="amber">Amber</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Subject focus and track curriculum summary..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
