/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Navbar, NavTab } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { ClassroomView } from "./components/ClassroomView";
import { TutorView } from "./components/TutorView";
import { AssessmentsView } from "./components/AssessmentsView";
import { SupportView } from "./components/SupportView";
import { CourseCreatorView } from "./components/CourseCreatorView";
import { InstructorDashboardView } from "./components/InstructorDashboardView";
import { AdminDashboardView } from "./components/AdminDashboardView";
import { GetUnstuckModal } from "./components/GetUnstuckModal";
import { CertificateModal } from "./components/CertificateModal";
import { RoleModal } from "./components/RoleModal";
import { LandingPageView } from "./components/LandingPageView";
import { LoginModal } from "./components/LoginModal";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { 
  Course, 
  Lesson, 
  StudentProfile, 
  TutorMessage, 
  TutorPersona, 
  AssessmentHistoryItem,
  UserRole,
  UserRecord,
  StudentSubmission,
  QuizItem,
  CategoryItem,
  EnrollmentRecord,
  PlatformActivityLog,
  ReportedContent
} from "./types";

import { 
  getStoredCourses, 
  saveStoredCourses, 
  getCompletedLessons, 
  saveCompletedLesson, 
  getCourseForTrack,
  getStoredProfile, 
  updateStoredProfile, 
  getStoredAssessments, 
  addAssessmentResult, 
  getStoredTutorHistory, 
  saveStoredTutorHistory,
  clearStoredTutorHistory,
  getStoredAuthSession,
  saveStoredAuthSession,
  AuthSession,
  getStoredUsers,
  saveStoredUsers,
  getStoredSubmissions,
  saveStoredSubmissions,
  getStoredQuizzes,
  saveStoredQuizzes,
  getStoredCategories,
  saveStoredCategories,
  getStoredEnrollments,
  saveStoredEnrollments,
  getStoredActivityLogs,
  logPlatformActivity,
  getStoredReportedContent,
  saveStoredReportedContent
} from "./utils/storage";

export default function App() {
  const [courses, setCourses] = useState<Course[]>(() => getStoredCourses());
  const [profile, setProfile] = useState<StudentProfile>(() => getStoredProfile());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => getCompletedLessons());
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryItem[]>(() => getStoredAssessments());
  const [authSession, setAuthSession] = useState<AuthSession>(() => getStoredAuthSession());
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>(() => 
    getStoredTutorHistory(getStoredAuthSession().email || getStoredProfile().email)
  );

  // RBAC State: Current Role
  const [currentRole, setCurrentRole] = useState<UserRole>(() => profile.userRole || "student");

  // Admin and Instructor Shared State
  const [users, setUsers] = useState<UserRecord[]>(() => getStoredUsers());
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => getStoredSubmissions());
  const [quizzes, setQuizzes] = useState<QuizItem[]>(() => getStoredQuizzes());
  const [categories, setCategories] = useState<CategoryItem[]>(() => getStoredCategories());
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>(() => getStoredEnrollments());
  const [activityLogs, setActivityLogs] = useState<PlatformActivityLog[]>(() => getStoredActivityLogs());
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>(() => getStoredReportedContent());

  // View navigation
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const role = profile.userRole || "student";
    if (role === "instructor") return "instructor";
    if (role === "admin") return "admin";
    return "dashboard";
  });
  const [selectedCourse, setSelectedCourse] = useState<Course>(() => {
    return getCourseForTrack(profile?.role || "Full Stack Development", courses) || courses[0];
  });
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(() => {
    const initialCourse = getCourseForTrack(profile?.role || "Full Stack Development", courses) || courses[0];
    return initialCourse?.modules?.[0]?.lessons?.[0] || courses[0]?.modules?.[0]?.lessons?.[0];
  });

  // Keep selected course synchronized when the student's registered track changes
  useEffect(() => {
    if (!profile?.role) return;
    const enrolled = getCourseForTrack(profile.role, courses);
    if (enrolled && selectedCourse?.id !== enrolled.id) {
      setSelectedCourse(enrolled);
      if (enrolled.modules?.[0]?.lessons?.[0]) {
        setSelectedLesson(enrolled.modules[0].lessons[0]);
      }
    }
  }, [profile?.role]);

  // Tutor context
  const [activeLessonContext, setActiveLessonContext] = useState<Lesson | null>(null);
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);

  // Assessment prefill
  const [assessmentPrefillTopic, setAssessmentPrefillTopic] = useState<string>("");

  // Landing & Auth State
  const [showLandingPage, setShowLandingPage] = useState<boolean>(() => {
    try {
      const session = getStoredAuthSession();
      return !session?.isLoggedIn;
    } catch {
      return true;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<"signin" | "signup">("signin");

  // Modals
  const [isUnstuckOpen, setIsUnstuckOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Sync courses to storage
  useEffect(() => {
    saveStoredCourses(courses);
  }, [courses]);

  // Sync tutor messages to storage isolated per active user email
  const activeUserEmail = authSession.email || profile.email;
  useEffect(() => {
    saveStoredTutorHistory(tutorMessages, activeUserEmail);
  }, [tutorMessages, activeUserEmail]);

  // Calculate count of earned certificates (courses with 100% completion)
  const earnedCertificatesCount = useMemo(() => {
    return (courses || []).filter((c) => {
      const modules = Array.isArray(c?.modules) ? c.modules : [];
      const total = modules.reduce((acc, m) => acc + (Array.isArray(m?.lessons) ? m.lessons.length : 0), 0);
      const done = modules.reduce(
        (acc, m) => acc + (Array.isArray(m?.lessons) ? m.lessons.filter((l) => completedLessons?.has ? completedLessons.has(l.id) : false).length : 0),
        0
      );
      return total > 0 && done === total;
    }).length;
  }, [courses, completedLessons]);

  // Role switching handler
  const handleSelectRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    handleUpdateProfile({ userRole: newRole });
    setShowLandingPage(false);

    if (newRole === "instructor") {
      setActiveTab("instructor");
    } else if (newRole === "admin") {
      setActiveTab("admin");
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleUpdateUsers = (updatedUsers: UserRecord[]) => {
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
  };

  const handleUpdateSubmissions = (updatedSubmissions: StudentSubmission[]) => {
    setSubmissions(updatedSubmissions);
    saveStoredSubmissions(updatedSubmissions);
  };

  const handleUpdateQuizzes = (updatedQuizzes: QuizItem[]) => {
    setQuizzes(updatedQuizzes);
    saveStoredQuizzes(updatedQuizzes);
  };

  const handleUpdateCategories = (updatedCategories: CategoryItem[]) => {
    setCategories(updatedCategories);
    saveStoredCategories(updatedCategories);
  };

  const handleUpdateEnrollments = (updatedEnrollments: EnrollmentRecord[]) => {
    setEnrollments(updatedEnrollments);
    saveStoredEnrollments(updatedEnrollments);
  };

  const handleUpdateReportedContent = (updatedReports: ReportedContent[]) => {
    setReportedContent(updatedReports);
    saveStoredReportedContent(updatedReports);
  };

  const handleLogActivity = (log: Omit<PlatformActivityLog, "id" | "timestamp">) => {
    const updated = logPlatformActivity(log);
    setActivityLogs(updated);
  };

  const handleUpdateProfile = (updated: Partial<StudentProfile>) => {
    const updatedProfile = updateStoredProfile((prev) => ({
      ...prev,
      ...updated,
    }));
    setProfile(updatedProfile);
    if (updated.userRole && updated.userRole !== currentRole) {
      setCurrentRole(updated.userRole);
    }
  };

  const handleNavigateToFullStackCourse = () => {
    const fullStackCourse = courses.find((c) => c.category === "Full Stack Development") || courses[0];
    if (fullStackCourse) {
      setSelectedCourse(fullStackCourse);
      if (fullStackCourse.modules[0]?.lessons[0]) {
        setSelectedLesson(fullStackCourse.modules[0].lessons[0]);
      }
      setActiveTab("classroom");
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    const firstLesson = course.modules[0]?.lessons[0];
    if (firstLesson) {
      setSelectedLesson(firstLesson);
    }
    setActiveTab("classroom");
  };

  const handleSelectLesson = (course: Course, lesson: Lesson) => {
    setSelectedCourse(course);
    setSelectedLesson(lesson);
    setActiveTab("classroom");
  };

  const handleCompleteLesson = (lessonId: string) => {
    const updated = saveCompletedLesson(lessonId);
    setCompletedLessons(new Set(updated));

    // Award +50 XP and increment completed count
    const updatedProfile = updateStoredProfile((prev) => {
      const newXp = prev.xp + 50;
      let newLevel = prev.level;
      let nextLevelXp = prev.nextLevelXp;

      if (newXp >= prev.nextLevelXp) {
        newLevel += 1;
        nextLevelXp += 2000;
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        nextLevelXp,
        completedLessonsCount: prev.completedLessonsCount + 1,
        studyMinutesThisWeek: prev.studyMinutesThisWeek + (selectedLesson?.durationMinutes || 20),
      };
    });

    setProfile(updatedProfile);
  };

  const handleAskTutorWithContext = (lesson: Lesson, customPrompt?: string) => {
    setActiveLessonContext(lesson);
    setActiveTab("tutor");
    if (customPrompt) {
      setTimeout(() => {
        handleSendMessageToTutor(customPrompt, "code_expert", lesson);
      }, 200);
    }
  };

  const handleLaunchAssessment = (topic: string) => {
    setAssessmentPrefillTopic(topic);
    setActiveTab("assessments");
  };

  const handleLaunchTutor = (topic: string) => {
    setActiveLessonContext({
      id: "quick-context",
      title: topic,
      summary: `Inquiry into ${topic}`,
      durationMinutes: 15,
      contentMarkdown: `Focused discussion on ${topic}`,
    });
    setActiveTab("tutor");
  };

  const handleSendMessageToTutor = async (text: string, persona: TutorPersona, contextLesson?: Lesson) => {
    const userMsg: TutorMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...tutorMessages, userMsg];
    setTutorMessages(newHistory);
    setIsTutorLoading(true);

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          contextLesson: contextLesson || activeLessonContext || undefined,
          persona,
          subject: selectedCourse?.title || "Full Stack Development & Computer Science",
          studentRole: profile.role || "Full Stack Development",
        }),
      });

      const data = await response.json();
      const botMsg: TutorMessage = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: data.reply || "I am here to guide your inquiry.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedFollowUps: data.suggestedFollowUps || [],
        persona,
        contextLessonTitle: (contextLesson || activeLessonContext)?.title,
      };

      setTutorMessages([...newHistory, botMsg]);
    } catch (err) {
      console.error("Tutor chat error:", err);
      const errorMsg: TutorMessage = {
        id: "ai-err-" + Date.now(),
        role: "assistant",
        content: "I encountered a transient connectivity error. Let us re-examine your question: " + text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setTutorMessages([...newHistory, errorMsg]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  const handleSaveAssessmentResult = (result: AssessmentHistoryItem) => {
    const enrichedResult: AssessmentHistoryItem = {
      ...result,
      courseId: result.courseId || selectedCourse.id,
      courseTitle: result.courseTitle || selectedCourse.title,
      userEmail: result.userEmail || authSession.email || profile.email,
    };
    const updated = addAssessmentResult(enrichedResult);
    setAssessmentHistory(updated);

    // Award +100 XP for completing assessment
    const updatedProfile = updateStoredProfile((prev) => ({
      ...prev,
      xp: prev.xp + 100,
    }));
    setProfile(updatedProfile);
  };

  const handleCourseCreated = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    setSelectedCourse(newCourse);
    if (newCourse.modules[0]?.lessons[0]) {
      setSelectedLesson(newCourse.modules[0].lessons[0]);
    }
    if (currentRole === "instructor") {
      setActiveTab("instructor");
    } else {
      setActiveTab("classroom");
    }
  };

  const handleLoginSuccess = (updatedUser: Partial<StudentProfile>) => {
    try {
      const updated = updateStoredProfile((prev) => ({
        ...prev,
        ...updatedUser,
      }));
      setProfile(updated);

      const activeEmail = updated.email || "student@alms.edu";

      // Refresh completed lessons for this authenticated user
      try {
        const userCompleted = getCompletedLessons(activeEmail);
        setCompletedLessons(userCompleted);
      } catch (e) {
        console.warn("Could not load user completed lessons", e);
      }

      // Refresh assessment records
      try {
        const currentAssessments = getStoredAssessments();
        setAssessmentHistory(currentAssessments);
      } catch (e) {
        console.warn("Could not load assessment history", e);
      }

      // Refresh tutor chat history isolated to this user account
      try {
        const userTutorHistory = getStoredTutorHistory(activeEmail);
        setTutorMessages(userTutorHistory);
      } catch (e) {
        console.warn("Could not load tutor history", e);
      }

      // Sync selected course to the student's enrolled track
      try {
        const enrolledCourse = getCourseForTrack(updated.role || "Full Stack Development", courses);
        if (enrolledCourse) {
          setSelectedCourse(enrolledCourse);
          if (enrolledCourse?.modules?.[0]?.lessons?.[0]) {
            setSelectedLesson(enrolledCourse.modules[0].lessons[0]);
          }
        }
      } catch (e) {
        console.warn("Could not sync enrolled course", e);
      }

      const role = updatedUser.userRole || updated.userRole || "student";
      setCurrentRole(role);
      if (role === "instructor") {
        setActiveTab("instructor");
      } else if (role === "admin") {
        setActiveTab("admin");
      } else {
        setActiveTab("dashboard");
      }

      const newSession: AuthSession = {
        isLoggedIn: true,
        email: activeEmail,
        userName: updated.name || "Student",
      };
      setAuthSession(newSession);
      saveStoredAuthSession(newSession);
    } catch (err) {
      console.error("Encountered error during handleLoginSuccess", err);
      setActiveTab("dashboard");
      setCurrentRole("student");
    } finally {
      setIsLoginModalOpen(false);
      setShowLandingPage(false);
    }
  };

  const handleLogout = () => {
    const newSession: AuthSession = { isLoggedIn: false };
    setAuthSession(newSession);
    saveStoredAuthSession(newSession);
    setTutorMessages([]);
    setShowLandingPage(true);
  };

  // If viewing the Landing Page
  if (showLandingPage) {
    return (
      <>
        <LandingPageView
          courses={courses}
          profile={profile}
          isLoggedIn={authSession.isLoggedIn}
          onEnterLMS={() => {
            if (currentRole === "admin") {
              setActiveTab("admin");
            } else if (currentRole === "instructor") {
              setActiveTab("instructor");
            } else {
              setActiveTab("dashboard");
            }
            setShowLandingPage(false);
          }}
          onLoginSuccess={handleLoginSuccess}
          onOpenLoginModal={(mode = "signin") => {
            setLoginModalMode(mode);
            setIsLoginModalOpen(true);
          }}
          onSelectCourse={(course) => {
            if (authSession.isLoggedIn) {
              handleSelectCourse(course);
              setShowLandingPage(false);
            } else {
              setLoginModalMode("signin");
              setIsLoginModalOpen(true);
            }
          }}
          onLogout={handleLogout}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          initialMode={loginModalMode}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      {/* Top Navigation with Role Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        onOpenUnstuck={() => setIsUnstuckOpen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onNavigateToLanding={() => setShowLandingPage(true)}
        onOpenLoginModal={() => {
          setLoginModalMode("signin");
          setIsLoginModalOpen(true);
        }}
        hasActiveLesson={Boolean(selectedLesson)}
        isLoggedIn={authSession.isLoggedIn}
        onLogout={handleLogout}
        earnedCertificatesCount={earnedCertificatesCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20 md:pb-12 min-w-0">
        <ErrorBoundary fallbackTitle="Student Dashboard View Notice">
          {/* Student Primary Dashboard */}
          {activeTab === "dashboard" && (
            <DashboardView
              courses={courses}
              profile={profile}
              completedLessons={completedLessons}
              assessmentHistory={assessmentHistory}
              onSelectCourse={handleSelectCourse}
              onSelectLesson={handleSelectLesson}
              onLaunchAssessment={handleLaunchAssessment}
              onLaunchTutor={handleLaunchTutor}
              onNavigateToCreator={() => setActiveTab("creator")}
              onNavigateToAssessments={() => setActiveTab("assessments")}
              onOpenRoleModal={() => setIsRoleModalOpen(true)}
              onOpenCertificate={() => setIsCertificateOpen(true)}
            />
          )}

        {/* Instructor Studio Dashboard */}
        {activeTab === "instructor" && (
          <InstructorDashboardView
            courses={courses}
            submissions={submissions}
            quizzes={quizzes}
            students={(users || []).filter((u) => u.role === "student")}
            onSaveCourses={(updatedCourses) => setCourses(updatedCourses)}
            onSaveSubmissions={handleUpdateSubmissions}
            onSaveQuizzes={handleUpdateQuizzes}
            onNavigateToCourse={(course, lesson) => {
              setSelectedCourse(course);
              if (lesson) setSelectedLesson(lesson);
              setActiveTab("classroom");
            }}
          />
        )}

        {/* Admin Governance Dashboard */}
        {activeTab === "admin" && (
          <AdminDashboardView
            users={users}
            courses={courses}
            categories={categories}
            enrollments={enrollments}
            activityLogs={activityLogs}
            reportedContent={reportedContent}
            onSaveUsers={handleUpdateUsers}
            onSaveCourses={(updatedCourses) => setCourses(updatedCourses)}
            onSaveCategories={handleUpdateCategories}
            onSaveEnrollments={handleUpdateEnrollments}
            onSaveReportedContent={handleUpdateReportedContent}
            onLogActivity={handleLogActivity}
          />
        )}

        {/* Classroom View */}
        {activeTab === "classroom" && (() => {
          const activeCourse = selectedCourse || courses[0];
          const activeLesson = (activeCourse && selectedLesson && activeCourse.modules.some((m) => m.lessons.some((l) => l.id === selectedLesson.id)))
            ? selectedLesson
            : activeCourse?.modules[0]?.lessons[0] || courses[0]?.modules[0]?.lessons[0];

          if (!activeCourse || !activeLesson) return null;

          return (
            <ClassroomView
              courses={courses}
              course={activeCourse}
              currentLesson={activeLesson}
              completedLessons={completedLessons}
              onSelectCourse={handleSelectCourse}
              onSelectLesson={(les) => setSelectedLesson(les)}
              onCompleteLesson={handleCompleteLesson}
              onAskTutorWithContext={handleAskTutorWithContext}
              onNavigateToAssessments={handleLaunchAssessment}
            />
          );
        })()}

        {/* AI Tutor View */}
        {activeTab === "tutor" && (
          <TutorView
            messages={tutorMessages}
            userEmail={activeUserEmail}
            userName={authSession.userName || profile.name}
            onSendMessage={handleSendMessageToTutor}
            onClearHistory={() => {
              clearStoredTutorHistory(activeUserEmail);
              setTutorMessages([]);
            }}
            activeLesson={activeLessonContext}
            onClearActiveLessonContext={() => setActiveLessonContext(null)}
            isLoading={isTutorLoading}
          />
        )}

        {/* Assessments View */}
        {activeTab === "assessments" && (
          <AssessmentsView
            course={selectedCourse}
            profile={profile}
            userEmail={authSession.email}
            history={assessmentHistory}
            onSaveAssessmentResult={handleSaveAssessmentResult}
            prefillTopic={assessmentPrefillTopic}
          />
        )}

        {/* Support View */}
        {activeTab === "support" && (
          <SupportView
            courses={courses}
            activeCourse={selectedCourse}
          />
        )}

        {/* Course Creator View */}
        {activeTab === "creator" && (
          <CourseCreatorView
            onCourseCreated={handleCourseCreated}
          />
        )}
        </ErrorBoundary>
      </main>

      {/* Modals */}
      <GetUnstuckModal
        isOpen={isUnstuckOpen}
        onClose={() => setIsUnstuckOpen(false)}
        activeContext={selectedLesson?.title || selectedCourse?.title}
      />

      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        profile={profile}
        course={selectedCourse || getCourseForTrack(profile.role, courses)}
        allCourses={courses}
        completedLessons={completedLessons}
        onResumeCourse={(targetCourse) => {
          setIsCertificateOpen(false);
          if (targetCourse) {
            handleSelectCourse(targetCourse);
          } else {
            setActiveTab("classroom");
          }
        }}
      />

      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onNavigateToFullStackCourse={handleNavigateToFullStackCourse}
        onLaunchAssessment={handleLaunchAssessment}
        onLaunchTutor={handleLaunchTutor}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={loginModalMode}
      />
    </div>
  );
}
