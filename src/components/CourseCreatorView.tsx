import React, { useState } from "react";
import { 
  PlusCircle, 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Layers, 
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { Course } from "../types";
import { fireCelebration } from "../utils/audioAndFx";

interface CourseCreatorViewProps {
  onCourseCreated: (newCourse: Course) => void;
}

export const CourseCreatorView: React.FC<CourseCreatorViewProps> = ({ onCourseCreated }) => {
  const [topic, setTopic] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");
  const [durationHours, setDurationHours] = useState(8);
  const [focusArea, setFocusArea] = useState("Practical engineering and industry production patterns");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null);

  const handleGenerateCourse = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setGeneratedCourse(null);

    try {
      const response = await fetch("/api/course/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          experienceLevel,
          targetDurationHours: durationHours,
          focusArea: focusArea.trim(),
        }),
      });

      const data = await response.json();
      if (data.course) {
        const fullCourse: Course = {
          ...data.course,
          bannerGradient: "from-cyan-600 via-blue-600 to-indigo-600",
          accentColor: "cyan",
          isCustomGenerated: true,
          progressPercent: 0,
        };
        setGeneratedCourse(fullCourse);
        fireCelebration();
      }
    } catch (err) {
      console.error("Course generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnroll = () => {
    if (generatedCourse) {
      onCourseCreated(generatedCourse);
    }
  };

  const sampleIdeas = [
    "Bioinformatics & CRISPR Sequence Analysis",
    "Quantum Computing Algorithms with Qiskit",
    "Rust Memory Safety & High-Concurrency Systems",
    "Autonomous Robotics & SLAM Navigation",
    "Algorithmic Trading & Reinforcement Learning",
  ];

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6 sm:space-y-8">
      {/* Creation Studio Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-8 shadow-xs space-y-5 sm:space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Curriculum Designer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit',sans-serif]">
            Generate a Custom Tailored Course
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Provide any subject or domain of interest. VertexLearn AI will architect a multi-unit interactive syllabus complete with code examples, comprehension checkpoints, and learning objectives.
          </p>
        </div>

        {/* Input Form */}
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Course Subject or Topic</label>
            <input
              id="input-new-course-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Distributed Consensus in Raft & Paxos, Neuro-symbolic AI"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-['Plus_Jakarta_Sans',sans-serif]"
            />
            {/* Sample Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Inspirations:</span>
              {sampleIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  onClick={() => setTopic(idea)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Learner Experience Level</label>
              <select
                id="select-course-level"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner (Foundations first)</option>
                <option value="Intermediate">Intermediate (Practical application)</option>
                <option value="Advanced">Advanced (Deep theoretical rigor)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Estimated Study Duration</label>
              <select
                id="select-course-duration"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={4}>4 Hours (Compact Sprint)</option>
                <option value={8}>8 Hours (Standard Deep Dive)</option>
                <option value={14}>14 Hours (Comprehensive Mastery)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Special Focus / Learning Priorities</label>
            <input
              id="input-course-focus"
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="e.g. Hands-on coding exercises, production deployment, mathematical proofs"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            id="btn-generate-curriculum"
            disabled={isGenerating || !topic.trim()}
            onClick={handleGenerateCourse}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              isGenerating || !topic.trim()
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Instructional AI is architecting course modules...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Interactive Course</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Course Preview & Enrollment */}
      {generatedCourse && (
        <div className="bg-white rounded-xl border border-indigo-200 p-4 sm:p-8 shadow-md space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Ready for Enrollment
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                {generatedCourse.title}
              </h2>
              <p className="text-xs text-slate-500">{generatedCourse.tagline}</p>
            </div>

            <button
              id="btn-enroll-custom-course"
              onClick={handleEnroll}
              className="w-full sm:w-auto py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Enroll & Begin Course</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {generatedCourse.description}
          </p>

          {/* Learning Outcomes */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Target Learning Outcomes:
            </span>
            <ul className="space-y-1.5">
              {generatedCourse.learningOutcomes.map((lo, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{lo}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Module Breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Curriculum Modules & Lessons</h3>
            <div className="space-y-3">
              {generatedCourse.modules.map((mod, modIdx) => (
                <div key={mod.id} className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-700">Module {modIdx + 1}: {mod.title}</span>
                    <span className="text-slate-400">{mod.lessons.length} lessons</span>
                  </div>
                  <p className="text-xs text-slate-500">{mod.description}</p>

                  <div className="pt-2 pl-2 space-y-1 border-l-2 border-indigo-100">
                    {mod.lessons.map((les) => (
                      <div key={les.id} className="flex items-center justify-between text-xs text-slate-700 py-1">
                        <span className="font-medium">• {les.title}</span>
                        <span className="text-[11px] text-slate-400">{les.durationMinutes} min read</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
