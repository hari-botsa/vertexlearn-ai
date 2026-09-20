import React, { useState } from "react";
import { 
  Layers, 
  X, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Brain, 
  Sparkles, 
  Edit3, 
  Save, 
  User, 
  Code2, 
  Database, 
  Server, 
  ShieldCheck, 
  Cloud,
  Crown
} from "lucide-react";
import { StudentProfile } from "../types";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onNavigateToFullStackCourse: () => void;
  onLaunchAssessment: (topic: string) => void;
  onLaunchTutor: (topic: string) => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onNavigateToFullStackCourse,
  onLaunchAssessment,
  onLaunchTutor,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [role, setRole] = useState(profile.role || "Full Stack Development");

  const avgProficiency = profile.trackCompetencies && profile.trackCompetencies.length > 0
    ? Math.round(profile.trackCompetencies.reduce((acc, c) => acc + c.proficiency, 0) / profile.trackCompetencies.length)
    : 100;

  if (!isOpen) return null;

  const handleSetAll100 = () => {
    const updated = (profile.trackCompetencies || []).map((c) => ({ ...c, proficiency: 100 }));
    onUpdateProfile({
      trackCompetencies: updated,
      level: 5,
      xp: 5000,
      nextLevelXp: 5000,
    });
  };

  const handleSave = () => {
    onUpdateProfile({
      name,
      title,
      role,
    });
    setIsEditing(false);
  };

  const getCompetencyIcon = (category: string) => {
    switch (category) {
      case "Frontend":
        return <Code2 className="w-4 h-4 text-blue-500" />;
      case "Backend":
        return <Server className="w-4 h-4 text-emerald-500" />;
      case "Database":
        return <Database className="w-4 h-4 text-amber-500" />;
      case "Architecture":
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      case "DevOps":
        return <Cloud className="w-4 h-4 text-cyan-500" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div 
      id="modal-role-profile"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Active Student Track & Competency Profile</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-['Outfit',sans-serif]">
                {profile.name}
              </h2>
              <p className="text-blue-200 text-xs sm:text-sm font-medium mt-0.5">
                {profile.title} • <span className="text-white font-semibold">{profile.role || "Full Stack Development"}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">{profile.email}</p>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Edit Form */}
          {isEditing && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Update Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-600 block mb-1">Career Learning Track / Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* Track Summary Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Current Role: {profile.role}</span>
              </div>
              <p className="text-xs text-slate-600">
                You are enrolled in the complete Full Stack Development specialization, covering modern React 19, Node.js microservices, PostgreSQL databases, and API security.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigateToFullStackCourse();
              }}
              className="shrink-0 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Full-Stack Course</span>
            </button>
          </div>

          {/* Full Stack Competencies */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Full Stack Competency Matrix
                </h3>
                {avgProficiency === 100 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center space-x-1 border border-emerald-200">
                    <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                    <span>100% Mastery</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-600 font-bold">Average: {avgProficiency}%</span>
                {avgProficiency < 100 && (
                  <button
                    onClick={handleSetAll100}
                    className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Set All to 100%
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {(profile.trackCompetencies || []).map((comp, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 font-semibold text-slate-800">
                      {getCompetencyIcon(comp.category)}
                      <span>{comp.skill}</span>
                    </div>
                    <span className="font-bold text-slate-900">{comp.proficiency}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${comp.proficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges Earned */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
              Earned Badges & Distinctions ({profile.badges.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.badges.map((badge) => (
                <div key={badge.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 shrink-0">
                    {badge.icon === "Crown" ? (
                      <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                    ) : (
                      <Award className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{badge.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{badge.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Earned {badge.earnedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onClose();
                  onLaunchTutor("Full Stack Web Architecture & React 19");
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ask Full-Stack AI Tutor</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onLaunchAssessment("Full Stack Web Architecture");
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Take Full-Stack Quiz</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
