import React, { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Award, 
  Clock, 
  RotateCcw, 
  BarChart, 
  AlertCircle, 
  ArrowRight,
  Send,
  BookOpen,
  FileCheck2,
  FileText,
  Layers,
  Filter,
  Compass,
  Check,
  ChevronDown,
  ChevronUp,
  UserCheck
} from "lucide-react";
import { Course, StudentProfile, Assessment, AssessmentQuestion, RubricEvaluation, AssessmentHistoryItem } from "../types";
import { fireCelebration } from "../utils/audioAndFx";
import { getCourseAssignmentModules, filterAssessmentsByCourse, CourseAssignmentModule } from "../utils/courseAssignments";

interface AssessmentsViewProps {
  course: Course;
  profile: StudentProfile;
  userEmail?: string;
  history: AssessmentHistoryItem[];
  onSaveAssessmentResult: (result: AssessmentHistoryItem) => void;
  prefillTopic?: string;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({
  course,
  profile,
  userEmail,
  history,
  onSaveAssessmentResult,
  prefillTopic = "",
}) => {
  // Course-aligned assignment modules
  const courseAssignmentModules = useMemo(() => {
    return getCourseAssignmentModules(course);
  }, [course]);

  // Initial topic default aligned with student's course
  const defaultCourseTopic = useMemo(() => {
    if (prefillTopic && prefillTopic.trim().length > 0) return prefillTopic;
    if (courseAssignmentModules.length > 0) return courseAssignmentModules[0].topic;
    return course.modules[0]?.lessons[0]?.title || course.title;
  }, [prefillTopic, courseAssignmentModules, course]);

  const [topicInput, setTopicInput] = useState(defaultCourseTopic);
  const [difficulty, setDifficulty] = useState<string>("Intermediate");
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    courseAssignmentModules[0]?.id || null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);

  // Filter mode for historical table: "course_only" (default) or "all"
  const [historyFilterMode, setHistoryFilterMode] = useState<"course_only" | "all">("course_only");
  const [expandedRubricId, setExpandedRubricId] = useState<string | null>(null);

  // Synchronize topic when student course or prefill topic changes
  useEffect(() => {
    if (prefillTopic && prefillTopic.trim().length > 0) {
      setTopicInput(prefillTopic);
    } else if (courseAssignmentModules.length > 0) {
      setTopicInput(courseAssignmentModules[0].topic);
      setSelectedModuleId(courseAssignmentModules[0].id);
    } else {
      setTopicInput(course.title);
    }
  }, [course.id, prefillTopic]);

  // Active quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result state
  const [completedResult, setCompletedResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    letterGrade: string;
    openEndedFeedback?: RubricEvaluation;
    questions: AssessmentQuestion[];
  } | null>(null);

  // Filtered history specifically for the student's registered course
  const courseHistory = useMemo(() => {
    return filterAssessmentsByCourse(history, course);
  }, [history, course]);

  const displayedHistory = historyFilterMode === "course_only" ? courseHistory : history;

  // Handle selecting a predefined course assignment module
  const handleSelectCourseModule = (mod: CourseAssignmentModule) => {
    setSelectedModuleId(mod.id);
    setTopicInput(mod.topic);
    setDifficulty(mod.difficulty);
    setQuestionCount(mod.recommendedQuestionCount);

    // Scroll smoothly to generator form
    const generatorElem = document.getElementById("generator-controls-section");
    if (generatorElem) {
      generatorElem.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Generate assessment from API
  const handleGenerate = async () => {
    if (!topicInput.trim()) return;
    setIsGenerating(true);
    setActiveAssessment(null);
    setCompletedResult(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const response = await fetch("/api/assessment/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicInput.trim(),
          difficulty,
          questionCount,
        }),
      });

      const data = await response.json();
      if (data.assessment) {
        data.assessment.topic = topicInput.trim();
        setActiveAssessment(data.assessment);
      }
    } catch (err) {
      console.error("Assessment generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  // Submit test for AI grading
  const handleSubmitAssessment = async () => {
    if (!activeAssessment) return;
    setIsSubmitting(true);

    try {
      let earnedPoints = 0;
      let totalPossible = 0;
      let openEndedEvaluation: RubricEvaluation | undefined = undefined;

      for (const q of activeAssessment.questions) {
        totalPossible += q.points;

        if (q.type === "multiple-choice") {
          const userChoice = userAnswers[q.id];
          if (userChoice === q.correctOptionIndex) {
            earnedPoints += q.points;
          }
        } else if (q.type === "open-ended") {
          const studentAnswer = (userAnswers[q.id] as string) || "";
          
          if (studentAnswer.trim().length > 0) {
            // Call AI Rubric Evaluation endpoint
            try {
              const evalRes = await fetch("/api/assessment/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  questionPrompt: q.prompt,
                  studentAnswer,
                  rubricGuidelines: q.rubricGuidelines || "Conceptual accuracy, depth, and practical clarity",
                  topic: activeAssessment.topic || course.title,
                }),
              });

              const evalData = await evalRes.json();
              if (evalData.evaluation) {
                openEndedEvaluation = evalData.evaluation;
                earnedPoints += Math.round((evalData.evaluation.score / 100) * q.points);
              }
            } catch (evalErr) {
              console.error("Failed to evaluate open-ended response:", evalErr);
              earnedPoints += Math.round(q.points * 0.8);
            }
          }
        }
      }

      const percentage = Math.round((earnedPoints / (totalPossible || 1)) * 100);
      let letterGrade = "A";
      if (percentage < 60) letterGrade = "F";
      else if (percentage < 70) letterGrade = "D";
      else if (percentage < 80) letterGrade = "C";
      else if (percentage < 90) letterGrade = "B";

      const finalResult = {
        score: earnedPoints,
        total: totalPossible,
        percentage,
        letterGrade,
        openEndedFeedback: openEndedEvaluation,
        questions: activeAssessment.questions,
      };

      setCompletedResult(finalResult);

      // Save to history tagged strictly with the student's enrolled course and email
      const historyRecord: AssessmentHistoryItem = {
        id: "eval-" + Date.now(),
        title: activeAssessment.title,
        topic: activeAssessment.topic || topicInput,
        courseId: course.id,
        courseTitle: course.title,
        userEmail: userEmail || profile.email,
        date: new Date().toISOString().split("T")[0],
        score: earnedPoints,
        totalPoints: totalPossible,
        percentage,
        letterGrade,
        openEndedFeedback: openEndedEvaluation,
      };

      onSaveAssessmentResult(historyRecord);

      if (percentage >= 80) {
        fireCelebration();
      }
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = activeAssessment?.questions[currentQuestionIndex];
  const totalQuestions = activeAssessment?.questions.length || 0;

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6 sm:space-y-8">
      {/* Student Session & Enrolled Course Indicator Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Student Session</span>
              </span>
              <span className="text-xs text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                {userEmail || profile.email}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-semibold">
                Track: {profile.role}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-bold text-white font-['Outfit',sans-serif]">
              Assignments & Assessments for: {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Filtered exclusively for your registered course track. All practical assignments, AI-evaluated rubrics, and historical records below directly reflect your enrollment in <strong>{course.title}</strong>.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Course Progress</span>
              <span className="text-sm sm:text-base font-extrabold text-white">
                {course.progressPercent}% Mastered
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700 flex items-center space-x-1">
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{courseHistory.length} Course Records</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Course-Aligned Assignment Modules: Quick Launch Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Curated Course Assignment Modules
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {courseAssignmentModules.length} Modules Aligned
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any core assignment module below to pre-configure your AI examination for this course.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {courseAssignmentModules.map((mod) => {
            const isSelected = selectedModuleId === mod.id && topicInput === mod.topic;
            return (
              <div
                key={mod.id}
                onClick={() => handleSelectCourseModule(mod)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                    : "border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      {mod.difficulty}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-600 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{mod.estimatedMinutes}m</span>
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {mod.title}
                  </h3>

                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-indigo-700 font-semibold">
                    {mod.recommendedQuestionCount} Questions
                  </span>
                  <button
                    type="button"
                    className={`text-[11px] font-bold px-2 py-1 rounded transition-colors ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "text-indigo-600 hover:bg-indigo-100"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select Topic"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generator Controls */}
      <div id="generator-controls-section" className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                Launch Course Assessment
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                AI Rubric Evaluation
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Synthesize adaptive quizzes and open-ended analysis questions tailored to your enrolled track.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Selected Subject:</span>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 truncate max-w-[220px]">
              {topicInput}
            </span>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-6 space-y-1">
            <label className="text-xs font-semibold text-slate-700">Course Assessment Topic</label>
            <input
              id="input-assessment-topic"
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder={`e.g. ${courseAssignmentModules[0]?.topic || course.title}`}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs font-semibold text-slate-700">Difficulty</label>
            <select
              id="select-assessment-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced (Rigorous)</option>
            </select>
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs font-semibold text-slate-700">Questions</label>
            <select
              id="select-assessment-count"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={3}>3 Questions (Quick Sprint)</option>
              <option value={4}>4 Questions (Balanced)</option>
              <option value={6}>6 Questions (Comprehensive)</option>
            </select>
          </div>
        </div>

        <button
          id="btn-generate-assessment"
          disabled={isGenerating || !topicInput.trim()}
          onClick={handleGenerate}
          className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            isGenerating || !topicInput.trim()
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Course Assessment for {course.title}...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Assessment for this Course</span>
            </>
          )}
        </button>
      </div>

      {/* Active Assessment Form */}
      {activeAssessment && !completedResult && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-8 shadow-xs space-y-6">
          {/* Header & Progress Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2 text-xs text-indigo-600 font-semibold">
                <FileCheck2 className="w-4 h-4" />
                <span>{course.category} • {activeAssessment.difficulty}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                {activeAssessment.title}
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-900">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Current Question Block */}
          {currentQ && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 uppercase tracking-wider">
                  {currentQ.type === "multiple-choice" ? "Multiple Choice" : "Open-Ended Analysis"}
                </span>
                <span className="font-bold text-indigo-700">{currentQ.points} Points</span>
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                {currentQ.prompt}
              </h3>

              {currentQ.codeSnippet && (
                <div className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-slate-200">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}

              {/* Answer input */}
              {currentQ.type === "multiple-choice" && currentQ.options && (
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[currentQ.id] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        id={`q-option-${optIdx}`}
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-start space-x-3 ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium shadow-xs ring-1 ring-indigo-500/20"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 text-slate-600"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="pt-0.5">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.type === "open-ended" && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-slate-500 italic">
                    AI Rubric Target: {currentQ.rubricGuidelines || "Demonstrate accuracy, underlying mechanics, and clear trade-offs."}
                  </p>
                  <textarea
                    id="input-open-ended-answer"
                    rows={6}
                    value={(userAnswers[currentQ.id] as string) || ""}
                    onChange={(e) => handleTextAnswerChange(currentQ.id, e.target.value)}
                    placeholder="Write your analytical answer here. The AI will evaluate clarity, accuracy, and depth..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-['Plus_Jakarta_Sans',sans-serif]"
                  />
                  <div className="text-right text-[11px] text-slate-400">
                    Word count: {((userAnswers[currentQ.id] as string) || "").trim().split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation & Submit Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentQuestionIndex === 0
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-600 hover:bg-slate-100 cursor-pointer"
              }`}
            >
              Previous
            </button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                id="btn-next-question"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            ) : (
              <button
                id="btn-submit-assessment"
                disabled={isSubmitting}
                onClick={handleSubmitAssessment}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Grading with AI Rubrics...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Instant AI Grading</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completed Results & Rubric Card */}
      {completedResult && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Assessment Completed for {course.title}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                Mastery Evaluation Report
              </h2>
            </div>

            {/* Score Display Card */}
            <div className="flex items-center space-x-3 sm:space-x-4 bg-slate-50 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border border-slate-200 w-fit">
              <div className="text-right">
                <div className="text-[11px] sm:text-xs text-slate-500 font-semibold">Total Score</div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {completedResult.score} / {completedResult.total}
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-md shadow-indigo-200">
                {completedResult.letterGrade}
              </div>
            </div>
          </div>

          {/* AI Rubric Detailed Evaluation Card */}
          {completedResult.openEndedFeedback && (
            <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-200/80 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Rubric Feedback & Qualitative Analysis</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {completedResult.openEndedFeedback.summaryFeedback}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Strengths */}
                <div className="p-3.5 rounded-lg bg-white/80 border border-emerald-200 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Key Strengths
                  </span>
                  <ul className="space-y-1">
                    {completedResult.openEndedFeedback.strengths.map((s, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start space-x-1.5">
                        <span className="text-emerald-500">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="p-3.5 rounded-lg bg-white/80 border border-amber-200 space-y-1.5">
                  <span className="text-xs font-bold text-amber-800 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 mr-1" /> Next Mastery Focus
                  </span>
                  <ul className="space-y-1">
                    {completedResult.openEndedFeedback.areasForImprovement.map((a, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start space-x-1.5">
                        <span className="text-amber-500">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Question-by-Question Review */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-sm text-slate-900">Pedagogical Review</h3>
            {completedResult.questions.map((q, idx) => {
              const isMc = q.type === "multiple-choice";
              const userAns = userAnswers[q.id];
              const isCorrect = isMc ? userAns === q.correctOptionIndex : true;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 text-xs space-y-2 bg-slate-50/50"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800">
                      Q{idx + 1}: {q.prompt}
                    </span>
                    {isMc && (
                      <span className={isCorrect ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                        {isCorrect ? "Correct (+ points)" : "Needs Review"}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => {
                setCompletedResult(null);
                setActiveAssessment(null);
              }}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Take Another Assessment
            </button>
          </div>
        </div>
      )}

      {/* Historical Assessment Records: Strictly Filtered by Student's Course */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Historical Assessment Record
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified records of past AI-evaluated quizzes and rubric examinations for this student track.
            </p>
          </div>

          {/* Course-Specific vs All Tracks Filter Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs font-semibold">
            <button
              id="filter-course-only"
              onClick={() => setHistoryFilterMode("course_only")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                historyFilterMode === "course_only"
                  ? "bg-white text-indigo-900 font-bold shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Registered Course Only ({courseHistory.length})</span>
            </button>

            <button
              id="filter-all-tracks"
              onClick={() => setHistoryFilterMode("all")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                historyFilterMode === "all"
                  ? "bg-white text-indigo-900 font-bold shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>All Tracks ({history.length})</span>
            </button>
          </div>
        </div>

        {/* Current Active Filter Indicator */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              Currently displaying:{" "}
              <strong className="text-slate-800">
                {historyFilterMode === "course_only"
                  ? `${course.title} (${courseHistory.length} assignments)`
                  : `All historical records across courses (${history.length} assignments)`}
              </strong>
            </span>
          </div>
          {historyFilterMode === "course_only" && (
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Student Enrolled Track
            </span>
          )}
        </div>

        {/* Historical Table */}
        {displayedHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Assessment Title</th>
                  <th className="py-2.5 px-3">Course / Module</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Grade</th>
                  <th className="py-2.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedHistory.map((item) => {
                  const isExpanded = expandedRubricId === item.id;
                  const isCurrentCourse =
                    item.courseId === course.id ||
                    (item.courseTitle && item.courseTitle === course.title);

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          <div className="flex items-center space-x-2">
                            <span>{item.title}</span>
                            {isCurrentCourse && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                This Course
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {item.topic}
                        </td>
                        <td className="py-3 px-3 text-slate-400">{item.date}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {item.score}/{item.totalPoints} ({item.percentage}%)
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              item.percentage >= 90
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.percentage >= 80
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {item.letterGrade}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {item.openEndedFeedback ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRubricId(isExpanded ? null : item.id)
                              }
                              className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                              <span>{isExpanded ? "Hide Feedback" : "View Feedback"}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Standard Quiz</span>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Rubric Feedback Row */}
                      {isExpanded && item.openEndedFeedback && (
                        <tr>
                          <td colSpan={6} className="bg-indigo-50/40 p-4 border-b border-indigo-100">
                            <div className="p-3.5 bg-white rounded-xl border border-indigo-200 text-xs space-y-2">
                              <div className="flex items-center space-x-2 text-indigo-900 font-bold">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Recorded AI Rubric Evaluation for: {item.title}</span>
                              </div>
                              <p className="text-slate-600 italic">
                                "{item.openEndedFeedback.summaryFeedback}"
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div className="p-2 rounded bg-emerald-50/60 border border-emerald-200">
                                  <span className="font-bold text-emerald-800 block text-[11px]">Strengths:</span>
                                  <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5 mt-0.5">
                                    {item.openEndedFeedback.strengths.map((s, idx) => (
                                      <li key={idx}>{s}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="p-2 rounded bg-amber-50/60 border border-amber-200">
                                  <span className="font-bold text-amber-800 block text-[11px]">Mastery Targets:</span>
                                  <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5 mt-0.5">
                                    {item.openEndedFeedback.areasForImprovement.map((a, idx) => (
                                      <li key={idx}>{a}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Past Assignments for this Course Yet</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You haven't completed any assessments for <strong>{course.title}</strong> yet. Select a module from the curated list above to generate your first graded assignment!
            </p>
            <button
              onClick={() => {
                if (courseAssignmentModules.length > 0) {
                  handleSelectCourseModule(courseAssignmentModules[0]);
                }
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Start First Module Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
