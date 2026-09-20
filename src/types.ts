export type TutorPersona = "socratic" | "deep" | "analogy" | "code_expert";

export interface TutorMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  persona?: TutorPersona;
  contextLessonTitle?: string;
}

export interface LessonCheckpoint {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  youtubeId?: string;
  embedUrl?: string;
  description: string;
  keyTakeaways?: string[];
}

export interface LessonReferenceLink {
  title: string;
  url: string;
  category: "Documentation" | "Specification" | "GitHub" | "Architecture Guide" | "Interactive Lab" | "Cheat Sheet";
  sourceName: string;
  description: string;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  durationMinutes: number;
  contentMarkdown: string;
  keyTerms?: string[];
  checkpoint?: LessonCheckpoint;
  completed?: boolean;
  video?: LessonVideo;
  referenceLinks?: LessonReferenceLink[];
  codeSnippet?: {
    language: string;
    code: string;
    title?: string;
    description?: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  overviewTheory?: string;
  video?: LessonVideo;
  referenceLinks?: LessonReferenceLink[];
  codeSnippet?: {
    language: string;
    code: string;
    title?: string;
    description?: string;
  };
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  durationHours: number;
  enrollmentCount: number;
  rating: number;
  bannerGradient: string;
  accentColor: string;
  prerequisites: string[];
  learningOutcomes: string[];
  modules: CourseModule[];
  isCustomGenerated?: boolean;
  progressPercent?: number;
}

export interface AssessmentQuestion {
  id: string;
  type: "multiple-choice" | "open-ended";
  prompt: string;
  codeSnippet?: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation: string;
  points: number;
  rubricGuidelines?: string;
}

export interface Assessment {
  title: string;
  description: string;
  difficulty: string;
  estimatedTimeMinutes: number;
  topic?: string;
  questions: AssessmentQuestion[];
}

export interface RubricEvaluation {
  score: number;
  letterGrade: string;
  summaryFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  suggestedReviewTopics: string[];
}

export interface AssessmentHistoryItem {
  id: string;
  title: string;
  topic: string;
  courseId?: string;
  courseTitle?: string;
  userEmail?: string;
  date: string;
  score: number;
  totalPoints: number;
  percentage: number;
  letterGrade: string;
  openEndedFeedback?: RubricEvaluation;
}

export interface TrackCompetency {
  skill: string;
  proficiency: number;
  category: "Frontend" | "Backend" | "Database" | "DevOps" | "Architecture";
}

export interface StudentProfile {
  name: string;
  email: string;
  title: string;
  role: string;
  userRole?: UserRole;
  level: number;
  xp: number;
  nextLevelXp: number;
  streakDays: number;
  completedLessonsCount: number;
  studyMinutesThisWeek: number;
  trackCompetencies?: TrackCompetency[];
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    earnedDate: string;
  }>;
}

export interface SupportTicket {
  id: string;
  category: "academic_advising" | "study_planning" | "technical" | "prerequisites";
  sender: "student" | "support_ai";
  text: string;
  timestamp: string;
}

export type UserRole = "student" | "instructor" | "admin";

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  quizTitle: string;
  submittedAt: string;
  score: number;
  totalPoints: number;
  percentage: number;
  letterGrade: string;
  status: "graded" | "needs_review";
  instructorFeedback?: string;
  openEndedResponse?: string;
}

export interface QuizItem {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  lessonTitle?: string;
  lessonTopic?: string;
  difficulty: string;
  questionsCount: number;
  createdAt: string;
  questions: AssessmentQuestion[];
}

export interface CourseAnalytics {
  courseId: string;
  courseTitle: string;
  enrolledCount: number;
  completionRate: number;
  averageScore: number;
  totalStudyHours: number;
  submissionsCount: number;
  rating: number;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  status: "active" | "suspended";
  enrolledCoursesCount?: number;
  createdCoursesCount?: number;
  joinedDate: string;
  lastActive: string;
  avatarBg?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  courseCount: number;
  color: string;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  progressPercent: number;
  status: "active" | "completed" | "dropped";
}

export interface PlatformActivityLog {
  id: string;
  type: "enrollment" | "course_published" | "quiz_submitted" | "role_switch" | "report_flag" | "user_registered" | "certificate_issued" | "system_alert";
  actorName: string;
  actorRole: UserRole;
  description: string;
  timestamp: string;
  severity: "info" | "success" | "warning";
}

export interface ReportedContent {
  id: string;
  type: "course" | "lesson" | "forum_comment" | "user";
  targetId: string;
  targetTitle: string;
  reporterName: string;
  reason: string;
  timestamp: string;
  status: "pending" | "resolved" | "dismissed";
  actionTaken?: string;
}
