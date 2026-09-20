import { 
  Course, 
  StudentProfile, 
  AssessmentHistoryItem, 
  TutorMessage,
  UserRole,
  UserRecord,
  StudentSubmission,
  QuizItem,
  CategoryItem,
  EnrollmentRecord,
  PlatformActivityLog,
  TrackCompetency,
  ReportedContent
} from "../types";
import { INITIAL_COURSES } from "../data/mockCourses";
import { SEED_COURSE_ASSESSMENTS, filterAssessmentsByCourse } from "./courseAssignments";

const COURSES_KEY = "vertexlearn_courses_v4";
const PROFILE_KEY = "vertexlearn_profile_v1";
const ASSESSMENTS_KEY = "vertexlearn_assessments_v1";
const TUTOR_HISTORY_KEY = "vertexlearn_tutor_history_v1";
const COMPLETED_LESSONS_KEY = "vertexlearn_completed_lessons_v1";

export const DEFAULT_PROFILE: StudentProfile = {
  name: "Hari Srinivas",
  email: "harisrinivasbotsa@gmail.com",
  title: "Senior Full Stack Software Engineer",
  role: "Full Stack Development",
  userRole: "student",
  level: 5,
  xp: 5000,
  nextLevelXp: 5000,
  streakDays: 14,
  completedLessonsCount: 16,
  studyMinutesThisWeek: 420,
  trackCompetencies: [
    { skill: "Frontend Architecture (React 19, TypeScript, Tailwind)", proficiency: 100, category: "Frontend" },
    { skill: "Backend Microservices (Node.js, Express, REST APIs)", proficiency: 100, category: "Backend" },
    { skill: "Database Layer (PostgreSQL, Connection Pools, ACID)", proficiency: 100, category: "Database" },
    { skill: "API Security & Auth (JWT, Middleware, Rate Limiting)", proficiency: 100, category: "Architecture" },
    { skill: "Cloud & Containerization (Docker, Caching, CI/CD)", proficiency: 100, category: "DevOps" },
  ],
  badges: [
    {
      id: "b-100",
      name: "100% Full-Stack Grandmaster",
      icon: "Crown",
      description: "Attained flawless 100% mastery across modern React 19, Node.js microservices, PostgreSQL, and cloud deployments",
      earnedDate: "2026-09-14",
    },
    {
      id: "b-fs",
      name: "Full-Stack Architect",
      icon: "Layers",
      description: "Engineered scalable end-to-end full stack web platforms with React and Node.js",
      earnedDate: "2026-09-14",
    },
    {
      id: "b-1",
      name: "7-Day Consistent Streak",
      icon: "Flame",
      description: "Maintained active daily study for 7 consecutive days",
      earnedDate: "2026-09-12",
    },
    {
      id: "b-2",
      name: "First Rubric Distinction",
      icon: "Award",
      description: "Earned an 'A' grade on an open-ended AI assessment",
      earnedDate: "2026-09-10",
    },
    {
      id: "b-3",
      name: "Socratic Inquirer",
      icon: "Brain",
      description: "Engaged in 20+ guided inquiry dialogues with Socrates AI",
      earnedDate: "2026-09-08",
    },
  ],
};

export function getCompetenciesForTrack(track: string): TrackCompetency[] {
  const t = (track || "").toLowerCase();
  if (t.includes("cloud") || t.includes("devops")) {
    return [
      { skill: "Pod Orchestration & Probes (K8s, Graceful Shutdown)", proficiency: 85, category: "DevOps" },
      { skill: "Containerization & Multi-Stage Builds (Docker)", proficiency: 90, category: "DevOps" },
      { skill: "CI/CD Automation & GitOps (GitHub Actions, Argo)", proficiency: 80, category: "Architecture" },
      { skill: "Distributed Observability (Prometheus, OpenTelemetry)", proficiency: 75, category: "Backend" },
      { skill: "Cloud Ingress & Service Mesh (Envoy, Nginx)", proficiency: 70, category: "Frontend" },
    ];
  }
  if (t.includes("ai") || t.includes("rag") || t.includes("generative") || t.includes("artificial")) {
    return [
      { skill: "Vector Embeddings & Semantic Chunking", proficiency: 85, category: "Database" },
      { skill: "Hybrid Search (BM25 + Dense Re-ranking)", proficiency: 80, category: "Architecture" },
      { skill: "Prompt Caching & Streaming Protocols", proficiency: 90, category: "Backend" },
      { skill: "Autonomous Agent Loops (ReAct, Tool Execution)", proficiency: 75, category: "Backend" },
      { skill: "LLM Safety Guardrails & Hallucination Defense", proficiency: 85, category: "Architecture" },
    ];
  }
  if (t.includes("machine") || t.includes("learning")) {
    return [
      { skill: "Transformer Architectures & Attention", proficiency: 80, category: "Architecture" },
      { skill: "Multi-Head Self-Attention Implementation", proficiency: 85, category: "Backend" },
      { skill: "Diffusion & Generative Models", proficiency: 75, category: "Database" },
      { skill: "Model Evaluation & Loss Metrics", proficiency: 85, category: "Backend" },
      { skill: "Inference Acceleration & Quantization", proficiency: 70, category: "DevOps" },
    ];
  }
  // Default: Full Stack Development
  return [
    { skill: "Frontend Architecture (React 19, TypeScript, Tailwind)", proficiency: 85, category: "Frontend" },
    { skill: "Backend Microservices (Node.js, Express, REST APIs)", proficiency: 85, category: "Backend" },
    { skill: "Database Layer (PostgreSQL, Connection Pools, ACID)", proficiency: 80, category: "Database" },
    { skill: "API Security & Auth (JWT, Middleware, Rate Limiting)", proficiency: 90, category: "Architecture" },
    { skill: "Cloud & Containerization (Docker, Caching, CI/CD)", proficiency: 75, category: "DevOps" },
  ];
}

export function getCourseForTrack(trackName: string, courses: Course[]): Course {
  if (!Array.isArray(courses) || courses.length === 0) return INITIAL_COURSES[0];
  const t = (trackName || "").toLowerCase();
  
  if (t.includes("cloud") || t.includes("devops")) {
    const found = courses.find((c) => c && (c.id === "cloud-devops-301" || c.category?.toLowerCase()?.includes("cloud")));
    if (found) return found;
  }
  if (t.includes("ai") || t.includes("rag") || t.includes("generative") || t.includes("artificial")) {
    const found = courses.find((c) => c && (c.id === "genai-arch-101" || c.category?.toLowerCase()?.includes("artificial")));
    if (found) return found;
  }
  if (t.includes("machine") || t.includes("learning")) {
    const found = courses.find((c) => c && (c.id === "deep-learning-201" || c.category?.toLowerCase()?.includes("machine")));
    if (found) return found;
  }
  if (t.includes("full stack") || t.includes("web")) {
    const found = courses.find((c) => c && (c.id === "fullstack-core-101" || c.category?.toLowerCase()?.includes("full stack")));
    if (found) return found;
  }

  // Fallback match on title or category or tagline
  const match = courses.find((c) => 
    c && (
      (c.title && c.title.toLowerCase().includes(t)) || 
      (c.category && c.category.toLowerCase().includes(t)) ||
      (c.tagline && c.tagline.toLowerCase().includes(t))
    )
  );
  return match || courses[0] || INITIAL_COURSES[0];
}

export function getStoredCourses(): Course[] {
  try {
    const raw = localStorage.getItem(COURSES_KEY);
    if (!raw) {
      localStorage.setItem(COURSES_KEY, JSON.stringify(INITIAL_COURSES));
      return INITIAL_COURSES;
    }
    const parsed: Course[] = JSON.parse(raw);
    const needsUpgrade = !Array.isArray(parsed) || parsed.length === 0 || parsed.some(c => !c.modules || c.modules.length < 3);
    if (needsUpgrade) {
      localStorage.setItem(COURSES_KEY, JSON.stringify(INITIAL_COURSES));
      return INITIAL_COURSES;
    }
    return parsed;
  } catch {
    return INITIAL_COURSES;
  }
}

export function saveStoredCourses(courses: Course[]) {
  try {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  } catch (err) {
    console.error("Failed to save courses to localStorage", err);
  }
}

export function getCompletedLessons(userEmail?: string): Set<string> {
  try {
    const effectiveEmail = userEmail || getStoredAuthSession().email || "student@alms.edu";
    const key = `${COMPLETED_LESSONS_KEY}_${effectiveEmail.toLowerCase()}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Seed 100% completion ONLY for the Grandmaster demo account (all 6 lessons of Modern Full-Stack Development)
      if (effectiveEmail.toLowerCase() === "student@alms.edu" || effectiveEmail.toLowerCase() === "harisrinivasbotsa@gmail.com") {
        const grandmasterInitial = ["fs-l-1", "fs-l-2", "fs-l-3", "fs-l-4", "fs-l-5", "fs-l-6"];
        localStorage.setItem(key, JSON.stringify(grandmasterInitial));
        return new Set(grandmasterInitial);
      }
      // For all other students / newly created accounts: 0 completed lessons (progress = 0%)
      localStorage.setItem(key, JSON.stringify([]));
      return new Set();
    }
    const parsed: string[] = JSON.parse(raw);
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function saveCompletedLesson(lessonId: string, userEmail?: string): Set<string> {
  try {
    const effectiveEmail = userEmail || getStoredAuthSession().email || "student@alms.edu";
    const key = `${COMPLETED_LESSONS_KEY}_${effectiveEmail.toLowerCase()}`;
    const current = getCompletedLessons(effectiveEmail);
    current.add(lessonId);
    localStorage.setItem(key, JSON.stringify(Array.from(current)));
    return current;
  } catch {
    return new Set([lessonId]);
  }
}

export function getStoredProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    const profile: StudentProfile = JSON.parse(raw);
    profile.role = profile.role || "Full Stack Development";
    profile.title = profile.title || "Senior Full Stack Software Engineer";
    if (profile.level === undefined) profile.level = 5;
    if (profile.xp === undefined) profile.xp = 5000;
    if (profile.nextLevelXp === undefined) profile.nextLevelXp = 5000;
    if (!profile.trackCompetencies || profile.trackCompetencies.length === 0) {
      profile.trackCompetencies = DEFAULT_PROFILE.trackCompetencies;
    }
    if (!profile.badges || profile.badges.length === 0) {
      profile.badges = DEFAULT_PROFILE.badges;
    }
    return profile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function updateStoredProfile(updater: (prev: StudentProfile) => StudentProfile): StudentProfile {
  try {
    const current = getStoredProfile();
    const updated = updater(current);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function getStoredAssessments(filterCourse?: Course | string): AssessmentHistoryItem[] {
  try {
    const raw = localStorage.getItem(ASSESSMENTS_KEY);
    let all: AssessmentHistoryItem[] = [];
    if (!raw) {
      all = SEED_COURSE_ASSESSMENTS;
      localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(all));
    } else {
      all = JSON.parse(raw);
      // If storage only contains old test data with < 5 items, seed the full course assignments
      if (all.length < SEED_COURSE_ASSESSMENTS.length) {
        const existingIds = new Set(all.map((a) => a.id));
        const missing = SEED_COURSE_ASSESSMENTS.filter((s) => !existingIds.has(s.id));
        if (missing.length > 0) {
          all = [...all, ...missing];
          localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(all));
        }
      }
    }

    if (!filterCourse) {
      return all;
    }

    if (typeof filterCourse === "object") {
      return filterAssessmentsByCourse(all, filterCourse);
    }

    // String filter
    return all.filter((a) => 
      (a.courseId && a.courseId.toLowerCase() === filterCourse.toLowerCase()) ||
      (a.courseTitle && a.courseTitle.toLowerCase().includes(filterCourse.toLowerCase())) ||
      (a.topic && a.topic.toLowerCase().includes(filterCourse.toLowerCase()))
    );
  } catch {
    return SEED_COURSE_ASSESSMENTS;
  }
}

export function addAssessmentResult(item: AssessmentHistoryItem): AssessmentHistoryItem[] {
  try {
    const raw = localStorage.getItem(ASSESSMENTS_KEY);
    let current: AssessmentHistoryItem[] = raw ? JSON.parse(raw) : SEED_COURSE_ASSESSMENTS;
    const updated = [item, ...current];
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [item];
  }
}

export function getTutorStorageKey(userEmail?: string): string {
  const email = userEmail || getStoredAuthSession().email || DEFAULT_PROFILE.email || "guest";
  return `${TUTOR_HISTORY_KEY}_${email.trim().toLowerCase()}`;
}

export function getStoredTutorHistory(userEmail?: string): TutorMessage[] {
  try {
    // If old legacy shared key exists, wipe it so accounts don't see shared leaks
    if (localStorage.getItem(TUTOR_HISTORY_KEY)) {
      localStorage.removeItem(TUTOR_HISTORY_KEY);
    }
    const key = getTutorStorageKey(userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredTutorHistory(messages: TutorMessage[], userEmail?: string) {
  try {
    const key = getTutorStorageKey(userEmail);
    localStorage.setItem(key, JSON.stringify(messages.slice(-50)));
  } catch (e) {
    console.error("Failed to save tutor history", e);
  }
}

export function clearStoredTutorHistory(userEmail?: string) {
  try {
    const key = getTutorStorageKey(userEmail);
    localStorage.removeItem(key);
  } catch (e) {
    console.error("Failed to clear tutor history", e);
  }
}

const AUTH_SESSION_KEY = "vertexlearn_auth_session_v1";

export interface AuthSession {
  isLoggedIn: boolean;
  email?: string;
  userName?: string;
  role?: UserRole;
}

export function getStoredAuthSession(): AuthSession {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) {
      // By default, authenticated as default student profile
      const defaultSession: AuthSession = {
        isLoggedIn: true,
        email: DEFAULT_PROFILE.email,
        userName: DEFAULT_PROFILE.name,
        role: "student",
      };
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(defaultSession));
      return defaultSession;
    }
    return JSON.parse(raw);
  } catch {
    return {
      isLoggedIn: true,
      email: DEFAULT_PROFILE.email,
      userName: DEFAULT_PROFILE.name,
      role: "student",
    };
  }
}

export function saveStoredAuthSession(session: AuthSession) {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to save auth session", e);
  }
}

// ================= USER RECORDS (STUDENTS & INSTRUCTORS & ADMINS) =================
const USERS_KEY = "vertexlearn_users_v1";

export const INITIAL_USERS: UserRecord[] = [
  {
    id: "usr-student-1",
    name: "Hari Srinivas",
    email: "harisrinivasbotsa@gmail.com",
    role: "student",
    title: "Senior Full Stack Software Engineer",
    status: "active",
    enrolledCoursesCount: 4,
    joinedDate: "2026-08-01",
    lastActive: "Just now",
    avatarBg: "from-indigo-600 to-indigo-800",
  },
  {
    id: "usr-student-2",
    name: "Maya Lin",
    email: "maya.lin@vertex.edu",
    role: "student",
    title: "AI Research Scholar & LLM Intern",
    status: "active",
    enrolledCoursesCount: 3,
    joinedDate: "2026-08-15",
    lastActive: "2 hours ago",
    avatarBg: "from-purple-600 to-pink-600",
  },
  {
    id: "usr-student-3",
    name: "Alex Chen",
    email: "alex.chen@vertex.edu",
    role: "student",
    title: "Distributed Systems & Cloud Engineer",
    status: "active",
    enrolledCoursesCount: 5,
    joinedDate: "2026-07-20",
    lastActive: "1 day ago",
    avatarBg: "from-emerald-600 to-teal-700",
  },
  {
    id: "usr-student-4",
    name: "Elena Rostova",
    email: "elena.r@mit.edu",
    role: "student",
    title: "Computer Vision & Quantum Researcher",
    status: "suspended",
    enrolledCoursesCount: 1,
    joinedDate: "2026-08-28",
    lastActive: "5 days ago",
    avatarBg: "from-slate-600 to-slate-800",
  },
  {
    id: "usr-inst-1",
    name: "Dr. Elena Rostova",
    email: "dr.rostova@vertexlearn.ai",
    role: "instructor",
    title: "Lead AI & Deep Learning Faculty",
    status: "active",
    createdCoursesCount: 3,
    joinedDate: "2026-05-10",
    lastActive: "10 mins ago",
    avatarBg: "from-indigo-700 to-purple-800",
  },
  {
    id: "usr-inst-2",
    name: "Marcus Thorne",
    email: "marcus.thorne@vertexlearn.ai",
    role: "instructor",
    title: "Principal Cloud Systems Architect",
    status: "active",
    createdCoursesCount: 2,
    joinedDate: "2026-06-01",
    lastActive: "1 hour ago",
    avatarBg: "from-blue-700 to-cyan-800",
  },
  {
    id: "usr-inst-3",
    name: "Prof. Sarah Jenkins",
    email: "sarah.j@vertexlearn.ai",
    role: "instructor",
    title: "Chair of Full Stack & Distributed Software",
    status: "active",
    createdCoursesCount: 4,
    joinedDate: "2026-04-12",
    lastActive: "3 hours ago",
    avatarBg: "from-emerald-700 to-teal-800",
  },
  {
    id: "usr-admin-1",
    name: "Vertex Admin Team",
    email: "admin@vertexlearn.ai",
    role: "admin",
    title: "Lead Academic & Platform Governor",
    status: "active",
    joinedDate: "2026-01-01",
    lastActive: "Active now",
    avatarBg: "from-slate-900 to-indigo-950",
  }
];

export function getStoredUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: UserRecord[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save users", e);
  }
}

// ================= INSTRUCTOR: STUDENT SUBMISSIONS & QUIZZES =================
const SUBMISSIONS_KEY = "vertexlearn_submissions_v1";
const QUIZZES_KEY = "vertexlearn_quizzes_v1";

export const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: "sub-101",
    studentId: "usr-student-1",
    studentName: "Hari Srinivas",
    studentEmail: "harisrinivasbotsa@gmail.com",
    courseId: "fullstack-core-101",
    courseTitle: "Modern Full Stack Web Architecture",
    quizTitle: "Microservices & Distributed Caching Check",
    submittedAt: "2026-09-14 16:45",
    score: 95,
    totalPoints: 100,
    percentage: 95,
    letterGrade: "A+",
    status: "graded",
    instructorFeedback: "Flawless reasoning on cache invalidation and distributed transactions. Excellent architecture diagram!",
    openEndedResponse: "I leveraged write-through cache patterns with Redis and distributed circuit breakers to prevent cascade failures.",
  },
  {
    id: "sub-102",
    studentId: "usr-student-2",
    studentName: "Maya Lin",
    studentEmail: "maya.lin@vertex.edu",
    courseId: "course-ai-agent",
    courseTitle: "Autonomous AI Agents with Gemini 2.0",
    quizTitle: "Agentic Tool Calling & Reasoning Loops",
    submittedAt: "2026-09-15 08:30",
    score: 88,
    totalPoints: 100,
    percentage: 88,
    letterGrade: "A-",
    status: "graded",
    instructorFeedback: "Strong grasp of ReAct loops. Consider adding defensive JSON schema recovery mechanisms.",
    openEndedResponse: "Implemented an iterative ReAct pattern with dual retry fallbacks when external APIs rate limit.",
  },
  {
    id: "sub-103",
    studentId: "usr-student-3",
    studentName: "Alex Chen",
    studentEmail: "alex.chen@vertex.edu",
    courseId: "course-k8s-cloud",
    courseTitle: "Cloud-Native Microservices on Kubernetes",
    quizTitle: "Pod Autoscaling & Ingress Controllers",
    submittedAt: "2026-09-15 09:12",
    score: 72,
    totalPoints: 100,
    percentage: 72,
    letterGrade: "B-",
    status: "needs_review",
    instructorFeedback: "Pending review of custom metrics HPA scaling equation.",
    openEndedResponse: "Configured Prometheus adapter to scale based on HTTP requests per second rather than raw memory usage.",
  },
];

export function getStoredSubmissions(): StudentSubmission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SUBMISSIONS;
  } catch {
    return INITIAL_SUBMISSIONS;
  }
}

export function saveStoredSubmissions(submissions: StudentSubmission[]) {
  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch (e) {
    console.error("Failed to save submissions", e);
  }
}

export function updateSubmissionGrade(subId: string, updates: Partial<StudentSubmission>) {
  const current = getStoredSubmissions();
  const next = current.map((s) => (s.id === subId ? { ...s, ...updates } : s));
  saveStoredSubmissions(next);
  return next;
}

export const INITIAL_INSTRUCTOR_QUIZZES: QuizItem[] = [
  {
    id: "quiz-fs-1",
    title: "Microservices & Distributed Systems Check",
    courseId: "fullstack-core-101",
    courseTitle: "Modern Full Stack Web Architecture",
    lessonTopic: "Resilient Microservices Architecture",
    difficulty: "Advanced",
    questionsCount: 4,
    createdAt: "2026-09-10",
    questions: [
      {
        id: "q-1",
        type: "multiple-choice",
        prompt: "Which pattern prevents a failing downstream service from cascading failures upstream?",
        options: ["Circuit Breaker Pattern", "Synchronous Polling", "Infinite Retry Loops", "Global Shared Memory"],
        correctOptionIndex: 0,
        explanation: "Circuit Breakers trip open when downstream calls fail excessively, returning fast fallbacks.",
        points: 25,
      },
      {
        id: "q-2",
        type: "multiple-choice",
        prompt: "What is the primary trade-off of Eventual Consistency over Strong Consistency?",
        options: [
          "Zero network overhead",
          "Higher availability and low latency at the cost of temporary stale reads",
          "Guaranteed linear serializability at all times",
          "Total avoidance of database schema migrations",
        ],
        correctOptionIndex: 1,
        explanation: "Eventual consistency allows replicas to synchronize asynchronously, trading immediate read freshness for partition tolerance.",
        points: 25,
      }
    ],
  },
  {
    id: "quiz-ai-1",
    title: "Autonomous Agents & Memory Systems",
    courseId: "course-ai-agent",
    courseTitle: "Autonomous AI Agents with Gemini 2.0",
    lessonTopic: "Vector Memory & RAG Decoupling",
    difficulty: "Intermediate",
    questionsCount: 3,
    createdAt: "2026-09-12",
    questions: [
      {
        id: "q-ai-1",
        type: "multiple-choice",
        prompt: "How does Semantic Chunking improve retrieval accuracy over fixed-size token splitting?",
        options: [
          "It ignores sentence boundaries completely",
          "It keeps logically coherent thoughts and paragraphs together, avoiding loss of contextual meaning",
          "It encrypts text vectors before embedding",
          "It forces all documents to be exactly 256 tokens long",
        ],
        correctOptionIndex: 1,
        explanation: "Semantic chunking breaks text on syntactic or semantic transitions rather than arbitrary token boundaries.",
        points: 30,
      }
    ]
  }
];

export function getStoredQuizzes(): QuizItem[] {
  try {
    const raw = localStorage.getItem(QUIZZES_KEY);
    if (!raw) {
      localStorage.setItem(QUIZZES_KEY, JSON.stringify(INITIAL_INSTRUCTOR_QUIZZES));
      return INITIAL_INSTRUCTOR_QUIZZES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_INSTRUCTOR_QUIZZES;
  } catch {
    return INITIAL_INSTRUCTOR_QUIZZES;
  }
}

export function saveStoredQuizzes(quizzes: QuizItem[]) {
  try {
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
  } catch (e) {
    console.error("Failed to save quizzes", e);
  }
}

// ================= ADMIN: CATEGORIES & ENROLLMENTS & AUDIT =================
const CATEGORIES_KEY = "vertexlearn_categories_v1";
const ENROLLMENTS_KEY = "vertexlearn_enrollments_v1";
const ACTIVITY_LOGS_KEY = "vertexlearn_activity_logs_v1";
const REPORTED_KEY = "vertexlearn_reported_v1";

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "cat-fs", name: "Full Stack & Web Architecture", slug: "full-stack", description: "Modern React, Node.js, Next.js, and API design", courseCount: 4, color: "indigo" },
  { id: "cat-ai", name: "Artificial Intelligence & LLMs", slug: "ai-ml", description: "Autonomous agents, Gemini SDK, embeddings & RAG", courseCount: 3, color: "purple" },
  { id: "cat-sys", name: "Cloud Infrastructure & DevOps", slug: "cloud-devops", description: "Kubernetes, Docker, CI/CD, and distributed observability", courseCount: 3, color: "emerald" },
  { id: "cat-sec", name: "Cybersecurity & Cryptography", slug: "cybersecurity", description: "Zero trust, OAuth2, JWT authentication, and hardening", courseCount: 2, color: "rose" },
  { id: "cat-data", name: "Data Engineering & Systems", slug: "data-engineering", description: "PostgreSQL, Kafka, BigQuery, and pipeline orchestration", courseCount: 2, color: "amber" },
];

export function getStoredCategories(): CategoryItem[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CATEGORIES;
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export function saveStoredCategories(categories: CategoryItem[]) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error("Failed to save categories", e);
  }
}

export const INITIAL_ENROLLMENTS: EnrollmentRecord[] = [
  {
    id: "enr-1",
    studentId: "usr-student-1",
    studentName: "Hari Srinivas",
    studentEmail: "harisrinivasbotsa@gmail.com",
    courseId: "fullstack-core-101",
    courseTitle: "Modern Full Stack Web Architecture",
    enrolledAt: "2026-08-05",
    progressPercent: 100,
    status: "completed",
  },
  {
    id: "enr-2",
    studentId: "usr-student-1",
    studentName: "Hari Srinivas",
    studentEmail: "harisrinivasbotsa@gmail.com",
    courseId: "course-ai-agent",
    courseTitle: "Autonomous AI Agents with Gemini 2.0",
    enrolledAt: "2026-08-18",
    progressPercent: 65,
    status: "active",
  },
  {
    id: "enr-3",
    studentId: "usr-student-2",
    studentName: "Maya Lin",
    studentEmail: "maya.lin@vertex.edu",
    courseId: "course-ai-agent",
    courseTitle: "Autonomous AI Agents with Gemini 2.0",
    enrolledAt: "2026-08-16",
    progressPercent: 85,
    status: "active",
  },
  {
    id: "enr-4",
    studentId: "usr-student-3",
    studentName: "Alex Chen",
    studentEmail: "alex.chen@vertex.edu",
    courseId: "course-k8s-cloud",
    courseTitle: "Cloud-Native Microservices on Kubernetes",
    enrolledAt: "2026-07-25",
    progressPercent: 70,
    status: "active",
  },
  {
    id: "enr-5",
    studentId: "usr-student-4",
    studentName: "Elena Rostova",
    studentEmail: "elena.r@mit.edu",
    courseId: "course-ai-agent",
    courseTitle: "Autonomous AI Agents with Gemini 2.0",
    enrolledAt: "2026-08-29",
    progressPercent: 20,
    status: "dropped",
  }
];

export function getStoredEnrollments(): EnrollmentRecord[] {
  try {
    const raw = localStorage.getItem(ENROLLMENTS_KEY);
    if (!raw) {
      localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(INITIAL_ENROLLMENTS));
      return INITIAL_ENROLLMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ENROLLMENTS;
  } catch {
    return INITIAL_ENROLLMENTS;
  }
}

export function saveStoredEnrollments(enrollments: EnrollmentRecord[]) {
  try {
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
  } catch (e) {
    console.error("Failed to save enrollments", e);
  }
}

export const INITIAL_ACTIVITY_LOGS: PlatformActivityLog[] = [
  {
    id: "act-1",
    type: "certificate_issued",
    actorName: "Hari Srinivas",
    actorRole: "student",
    description: "Earned Verified Certificate in Modern Full Stack Web Architecture (100% Distinction).",
    timestamp: "10 mins ago",
    severity: "success",
  },
  {
    id: "act-2",
    type: "quiz_submitted",
    actorName: "Maya Lin",
    actorRole: "student",
    description: "Submitted Agentic Tool Calling & Reasoning Loops quiz (Grade: A-).",
    timestamp: "45 mins ago",
    severity: "info",
  },
  {
    id: "act-3",
    type: "course_published",
    actorName: "Dr. Elena Rostova",
    actorRole: "instructor",
    description: "Published revised curriculum modules for Autonomous AI Agents.",
    timestamp: "2 hours ago",
    severity: "success",
  },
  {
    id: "act-4",
    type: "user_registered",
    actorName: "Liam Vance",
    actorRole: "student",
    description: "Registered new student account via Google Workspace SSO.",
    timestamp: "4 hours ago",
    severity: "info",
  },
  {
    id: "act-5",
    type: "report_flag",
    actorName: "Automated AI Content Filter",
    actorRole: "admin",
    description: "Flagged discussion comment for potential code plagarism verification.",
    timestamp: "6 hours ago",
    severity: "warning",
  },
];

export function getStoredActivityLogs(): PlatformActivityLog[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(INITIAL_ACTIVITY_LOGS));
      return INITIAL_ACTIVITY_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ACTIVITY_LOGS;
  } catch {
    return INITIAL_ACTIVITY_LOGS;
  }
}

export function logPlatformActivity(log: Omit<PlatformActivityLog, "id" | "timestamp">) {
  const current = getStoredActivityLogs();
  const newEntry: PlatformActivityLog = {
    id: "act-" + Date.now(),
    timestamp: "Just now",
    ...log,
  };
  const updated = [newEntry, ...current.slice(0, 49)];
  try {
    localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save activity log", e);
  }
  return updated;
}

export const INITIAL_REPORTED_CONTENT: ReportedContent[] = [
  {
    id: "rep-1",
    type: "forum_comment",
    targetId: "com-981",
    targetTitle: "Discussion Thread on Zero-Day Exploit POC",
    reporterName: "Marcus Thorne (Instructor)",
    reason: "Student posted raw exploit binaries without educational sandboxing context.",
    timestamp: "Yesterday, 14:20",
    status: "pending",
  },
  {
    id: "rep-2",
    type: "course",
    targetId: "course-temp-404",
    targetTitle: "Cryptocurrency Speculative Arbitrage Bot",
    reporterName: "Elena Rostova (Student)",
    reason: "Content misleading; resembles financial solicitation rather than computational science.",
    timestamp: "3 days ago",
    status: "resolved",
    actionTaken: "Course unpublished and author notified for curriculum overhaul.",
  },
];

export function getStoredReportedContent(): ReportedContent[] {
  try {
    const raw = localStorage.getItem(REPORTED_KEY);
    if (!raw) {
      localStorage.setItem(REPORTED_KEY, JSON.stringify(INITIAL_REPORTED_CONTENT));
      return INITIAL_REPORTED_CONTENT;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_REPORTED_CONTENT;
  } catch {
    return INITIAL_REPORTED_CONTENT;
  }
}

export function saveStoredReportedContent(items: ReportedContent[]) {
  try {
    localStorage.setItem(REPORTED_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save reported content", e);
  }
}

