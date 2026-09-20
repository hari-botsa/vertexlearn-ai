import React, { useState, useEffect } from "react";
import {
  X,
  Award,
  ShieldCheck,
  Printer,
  Download,
  Crown,
  Lock,
  BookOpen,
  AlertCircle,
  Check,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";
import { StudentProfile, Course } from "../types";
import { downloadCertificatePDF } from "../utils/pdfGenerator";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  course?: Course;
  allCourses?: Course[];
  completedLessons?: Set<string>;
  onResumeCourse?: (targetCourse?: Course) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  profile,
  course,
  allCourses = [],
  completedLessons = new Set<string>(),
  onResumeCourse,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState<string>("");

  // Determine full list of candidate courses
  const courseList = React.useMemo(() => {
    const list: Course[] = [];
    const seen = new Set<string>();

    if (allCourses && allCourses.length > 0) {
      allCourses.forEach((c) => {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          list.push(c);
        }
      });
    }

    if (course && !seen.has(course.id)) {
      seen.add(course.id);
      list.unshift(course);
    }

    return list;
  }, [allCourses, course]);

  // Helper to compute course completion status
  const getCourseCompletionStats = (c: Course) => {
    const total = c.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const done = c.modules.reduce(
      (acc, m) => acc + m.lessons.filter((l) => completedLessons.has(l.id)).length,
      0
    );
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const isCompleted = total > 0 && done === total;
    return { total, done, percent, isCompleted };
  };

  // Completed courses that have achieved strictly 100% completion
  const completedCourses = React.useMemo(() => {
    return courseList.filter((c) => {
      const { isCompleted } = getCourseCompletionStats(c);
      return isCompleted;
    });
  }, [courseList, completedLessons]);

  // Set default selected course when modal opens or courses change
  useEffect(() => {
    if (!isOpen) return;

    // 1. If currently selected course in prop exists, check if it's 100% completed or prioritize it
    if (course) {
      const propStats = getCourseCompletionStats(course);
      if (propStats.isCompleted) {
        setActiveCourseId(course.id);
        return;
      }
    }

    // 2. Otherwise default to the first 100% completed course
    if (completedCourses.length > 0) {
      setActiveCourseId(completedCourses[0].id);
      return;
    }

    // 3. Fallback to passed course or first available course
    if (course) {
      setActiveCourseId(course.id);
    } else if (courseList.length > 0) {
      setActiveCourseId(courseList[0].id);
    }
  }, [isOpen, course?.id, completedCourses.length]);

  if (!isOpen) return null;

  // Selected course object
  const currentSelectedCourse =
    courseList.find((c) => c.id === activeCourseId) ||
    course ||
    courseList[0];

  if (!currentSelectedCourse) return null;

  const { total: totalLessons, done: doneLessons, percent: progressPercent, isCompleted: is100Percent } =
    getCourseCompletionStats(currentSelectedCourse);

  const certificateId =
    "VL-" +
    Math.abs(hashCode(currentSelectedCourse.id + profile.name))
      .toString(16)
      .toUpperCase()
      .padStart(8, "0");

  const issueDateFormatted = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function hashCode(s: string) {
    return s.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  const handleDownloadPDF = async () => {
    // Strictly prevent downloading when course is not 100% complete
    if (!is100Percent) return;

    setIsDownloading(true);
    setDownloadSuccess(false);
    const element = document.getElementById("certificate-printable-card");
    const success = await downloadCertificatePDF(element, {
      profile,
      course: currentSelectedCourse,
      certificateId,
      issueDate: issueDateFormatted,
      is100Percent,
      completionScore: 100,
    });

    setIsDownloading(false);
    if (success) {
      setDownloadSuccess(true);
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      setTimeout(() => setDownloadSuccess(false), 4000);
    }
  };

  const handlePrint = () => {
    if (!is100Percent) return;
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-20">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
            <Award className="w-4 h-4 text-emerald-600" />
            <span className="font-['Outfit',sans-serif] font-bold text-sm text-slate-900">
              Student Certificates & Verified Credentials
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
              {completedCourses.length} {completedCourses.length === 1 ? "Certificate Earned" : "Certificates Earned"}
            </span>
          </div>
          <button
            id="btn-close-certificate-modal"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
            title="Close certificates modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-Course Certificate Selector Tabs (Shows all completed courses & enrolled courses) */}
        {courseList.length > 1 && (
          <div className="bg-slate-100/80 px-3 sm:px-4 py-2.5 border-b border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="uppercase tracking-wider flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select Course Credential</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {completedCourses.length} of {courseList.length} courses completed at 100%
              </span>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {courseList.map((c) => {
                const stats = getCourseCompletionStats(c);
                const isSelected = c.id === currentSelectedCourse.id;

                return (
                  <button
                    key={c.id}
                    id={`cert-tab-${c.id}`}
                    onClick={() => setActiveCourseId(c.id)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-white text-indigo-900 border-indigo-300 shadow-xs ring-2 ring-indigo-500/20"
                        : "bg-white/60 hover:bg-white text-slate-600 border-slate-200/80"
                    }`}
                  >
                    {stats.isCompleted ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}

                    <div className="text-left">
                      <div className="font-bold line-clamp-1 max-w-[160px] sm:max-w-[200px]">
                        {c.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {stats.isCompleted ? (
                          <span className="text-emerald-600 font-bold">100% Verified Certificate</span>
                        ) : (
                          <span className="text-amber-700">{stats.percent}% in progress</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Success toast banner */}
        {downloadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800 font-semibold animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Certificate PDF successfully generated and downloaded!</span>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Saved to Downloads
            </span>
          </div>
        )}

        {/* Course Completion Status Notice */}
        {is100Percent ? (
          <div className="bg-emerald-50/80 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center space-x-2 font-medium">
              <Crown className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
              <span>
                <strong>100% Course Completed:</strong> You have mastered all <strong>{totalLessons} lessons</strong> of{" "}
                <strong className="text-emerald-950">{currentSelectedCourse.title}</strong>. Official certificate is generated and ready to download!
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900">
            <div className="flex items-start sm:items-center space-x-2 font-medium">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Incomplete Course ({progressPercent}%):</strong> You have completed <strong>{doneLessons} of {totalLessons}</strong> lessons.
                The certificate is generated and downloadable <strong>only after 100% completion</strong>.
              </span>
            </div>
            {onResumeCourse && (
              <button
                id="btn-resume-selected-course"
                onClick={() => {
                  onResumeCourse(currentSelectedCourse);
                  onClose();
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                Complete Remaining Lessons
              </button>
            )}
          </div>
        )}

        {/* Certificate Sheet (Printable / Preview Card) */}
        <div
          id="certificate-printable-card"
          className="p-5 sm:p-10 bg-gradient-to-b from-white via-indigo-50/20 to-white text-center space-y-5 sm:space-y-6 relative border-4 sm:border-8 border-double border-indigo-200/80 m-2 sm:m-4 rounded-xl shadow-inner bg-white"
        >
          {/* Watermark badge for Preview Mode */}
          {!is100Percent && (
            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-[10px] font-extrabold text-amber-800 uppercase tracking-wider shadow-2xs">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>Preview Sample • Unverified Until 100% Completed</span>
            </div>
          )}

          <div className="flex items-center justify-center space-x-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight font-['Outfit',sans-serif] text-slate-900">
              Virtual Learner <span className="text-indigo-600">ALMS</span>
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] sm:text-[11px] font-bold tracking-widest text-indigo-600 uppercase">
              Certificate of Academic & Technical Mastery
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">This credential certifies that</p>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif] pt-1">
              {profile.name}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              has successfully completed all adaptive learning modules, interactive checkpoints, and AI-evaluated assessments for
            </p>
          </div>

          <div className="py-3 px-4 sm:px-6 bg-slate-50 rounded-xl border border-slate-200 inline-block max-w-lg space-y-1.5 w-full sm:w-auto">
            <div className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
              {currentSelectedCourse.title}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500">
              Curriculum Category: {currentSelectedCourse.category} • Difficulty: {currentSelectedCourse.difficulty} • {currentSelectedCourse.durationHours} Estimated Hours
            </div>
            <div
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold border shadow-xs ${
                is100Percent
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <Crown
                className={`w-3.5 h-3.5 ${
                  is100Percent ? "text-amber-600 fill-amber-500" : "text-amber-500"
                }`}
              />
              <span>
                {is100Percent
                  ? "100% Flawless Mastery & Distinction Honors"
                  : `Curriculum Progress: ${progressPercent}% Completed (${totalLessons - doneLessons} lessons remaining)`}
              </span>
            </div>
          </div>

          {/* Verification seal & signature block */}
          <div className="pt-4 sm:pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left text-[10px] sm:text-[11px] text-slate-500">
            <div>
              <div className="font-mono font-semibold text-slate-700">
                Credential ID: {is100Percent ? certificateId : "PREVIEW-PENDING-COMPLETION"}
              </div>
              <div>Issued: {issueDateFormatted}</div>
            </div>

            {is100Percent ? (
              <div className="flex items-center space-x-2 text-emerald-600 font-semibold">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
                <span>AI Evaluated & Authenticated</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-amber-600 font-semibold">
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Official Seal Locked (100% Required)</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-0 z-10">
          {/* Status Note on Left */}
          {is100Percent ? (
            <div className="text-xs text-slate-500 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Ready to export: <strong className="text-slate-700">Official High-Res PDF (A4 Landscape)</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/80 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Certificate generation disabled until course reaches 100% completion</span>
            </div>
          )}

          {/* Action Buttons on Right: DOWNLOAD ONLY ACTIVE WHEN COURSE REACHES 100% */}
          <div className="flex items-center space-x-2 justify-end">
            {is100Percent ? (
              <>
                <button
                  id="btn-download-pdf"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-print-cert"
                  onClick={handlePrint}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </>
            ) : (
              onResumeCourse && (
                <button
                  id="btn-resume-course-from-cert"
                  onClick={() => {
                    onResumeCourse(currentSelectedCourse);
                    onClose();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Resume & Complete Course</span>
                </button>
              )
            )}

            <button
              id="btn-close-cert-dialog"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
