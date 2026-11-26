import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { DemoRoleSwitcher } from '../../components/shared/DemoRoleSwitcher';
import { AdminLayout } from '../../features/admin/components/AdminLayout';
import { AdminAnalyticsPage } from '../../features/admin/pages/AdminAnalyticsPage';
import { AdminApprovalsPage } from '../../features/admin/pages/AdminApprovalsPage';
import { AdminCommunityPage } from '../../features/admin/pages/AdminCommunityPage';
import { AdminCourseDetailsPage } from '../../features/admin/pages/AdminCourseDetailsPage';
import { AdminCoursesPage } from '../../features/admin/pages/AdminCoursesPage';
import { AdminDashboardPage } from '../../features/admin/pages/AdminDashboardPage';
import { AdminDisciplinesPage } from '../../features/admin/pages/AdminDisciplinesPage';
import { AdminEnrollmentsPage } from '../../features/admin/pages/AdminEnrollmentsPage';
import { AdminInstructorDetailsPage } from '../../features/admin/pages/AdminInstructorDetailsPage';
import { AdminInstructorsPage } from '../../features/admin/pages/AdminInstructorsPage';
import { AdminNotificationsPage } from '../../features/admin/pages/AdminNotificationsPage';
import { AdminReviewsPage } from '../../features/admin/pages/AdminReviewsPage';
import { AdminSettingsPage } from '../../features/admin/pages/AdminSettingsPage';
import { AdminStudentDetailsPage } from '../../features/admin/pages/AdminStudentDetailsPage';
import { AdminStudentsPage } from '../../features/admin/pages/AdminStudentsPage';
import { InstructorLayout } from '../../features/instructor/components/InstructorLayout';
import { AnnouncementsPage } from '../../features/instructor/pages/AnnouncementsPage';
import { CommunityManagementPage } from '../../features/instructor/pages/CommunityManagementPage';
import { CoursePreviewPage } from '../../features/instructor/pages/CoursePreviewPage';
import { CourseProposalPage } from '../../features/instructor/pages/CourseProposalPage';
import { EditCoursePage } from '../../features/instructor/pages/EditCoursePage';
import { InstructorAnalyticsPage } from '../../features/instructor/pages/InstructorAnalyticsPage';
import { InstructorCommunityListPage } from '../../features/instructor/pages/InstructorCommunityListPage';
import { InstructorConversationPage } from '../../features/instructor/pages/InstructorConversationPage';
import { InstructorCourseManagementPage } from '../../features/instructor/pages/InstructorCourseManagementPage';
import { InstructorCoursesPage } from '../../features/instructor/pages/InstructorCoursesPage';
import { InstructorDashboardPage } from '../../features/instructor/pages/InstructorDashboardPage';
import { InstructorEnrollmentDetailsPage } from '../../features/instructor/pages/InstructorEnrollmentDetailsPage';
import { InstructorEnrollmentsPage } from '../../features/instructor/pages/InstructorEnrollmentsPage';
import { InstructorMessagesPage } from '../../features/instructor/pages/InstructorMessagesPage';
import { InstructorOwnProfilePage } from '../../features/instructor/pages/InstructorOwnProfilePage';
import { InstructorSettingsPage } from '../../features/instructor/pages/InstructorSettingsPage';
import { InstructorStudentsPage } from '../../features/instructor/pages/InstructorStudentsPage';
import { LessonBuilderPage } from '../../features/instructor/pages/LessonBuilderPage';
import { LessonManagementPage } from '../../features/instructor/pages/LessonManagementPage';
import { StudentDetailsPage } from '../../features/instructor/pages/StudentDetailsPage';
import { AboutPage } from '../../features/public/pages/AboutPage';
import { CourseDetailsPage } from '../../features/public/pages/CourseDetailsPage';
import { CoursesPage } from '../../features/public/pages/CoursesPage';
import { DisciplineDetailsPage } from '../../features/public/pages/DisciplineDetailsPage';
import { DisciplinesPage } from '../../features/public/pages/DisciplinesPage';
import { HomePage } from '../../features/public/pages/HomePage';
import { InstructorProfilePage } from '../../features/public/pages/InstructorProfilePage';
import { InstructorsPage } from '../../features/public/pages/InstructorsPage';
import { LoginPage } from '../../features/public/pages/LoginPage';
import { NotFoundPage } from '../../features/public/pages/NotFoundPage';
import { RegisterPage } from '../../features/public/pages/RegisterPage';
import { StudentLayout } from '../../features/student/components/StudentLayout';
import { CertificatesPage } from '../../features/student/pages/CertificatesPage';
import { CommunityListPage } from '../../features/student/pages/CommunityListPage';
import { ConversationPage } from '../../features/student/pages/ConversationPage';
import { CourseCommunityPage } from '../../features/student/pages/CourseCommunityPage';
import { EnrollmentRequestsPage } from '../../features/student/pages/EnrollmentRequestsPage';
import { ExploreCoursesPage } from '../../features/student/pages/ExploreCoursesPage';
import { LearningProgressPage } from '../../features/student/pages/LearningProgressPage';
import { LessonClassroomPage } from '../../features/student/pages/LessonClassroomPage';
import { MessagesPage } from '../../features/student/pages/MessagesPage';
import { MyLearningPage } from '../../features/student/pages/MyLearningPage';
import { NotificationsPage } from '../../features/student/pages/NotificationsPage';
import { StudentCourseOverviewPage } from '../../features/student/pages/StudentCourseOverviewPage';
import { StudentDashboardPage } from '../../features/student/pages/StudentDashboardPage';
import { StudentExploreCourseDetailsPage } from '../../features/student/pages/StudentExploreCourseDetailsPage';
import { StudentProfilePage } from '../../features/student/pages/StudentProfilePage';
import { StudentSettingsPage } from '../../features/student/pages/StudentSettingsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/disciplines" element={<DisciplinesPage />} />
          <Route path="/disciplines/:slug" element={<DisciplineDetailsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailsPage />} />
          <Route path="/instructors" element={<InstructorsPage />} />
          <Route path="/instructors/:slug" element={<InstructorProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboardPage />} />
          <Route path="my-learning" element={<MyLearningPage />} />
          <Route path="explore-courses" element={<ExploreCoursesPage />} />
          <Route path="explore-courses/:courseId" element={<StudentExploreCourseDetailsPage />} />
          <Route path="enrollment-requests" element={<EnrollmentRequestsPage />} />
          <Route path="courses/:courseId" element={<StudentCourseOverviewPage />} />
          <Route path="courses/:courseId/lessons/:lessonId" element={<LessonClassroomPage />} />
          <Route path="progress" element={<LearningProgressPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route path="community" element={<CommunityListPage />} />
          <Route path="community/:courseId" element={<CourseCommunityPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="messages/:conversationId" element={<ConversationPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="settings" element={<StudentSettingsPage />} />
        </Route>

        <Route path="/instructor" element={<InstructorLayout />}>
          <Route index element={<InstructorDashboardPage />} />
          <Route path="courses" element={<InstructorCoursesPage />} />
          <Route path="courses/new" element={<CourseProposalPage />} />
          <Route path="courses/:courseId" element={<InstructorCourseManagementPage />} />
          <Route path="courses/:courseId/edit" element={<EditCoursePage />} />
          <Route path="courses/:courseId/curriculum" element={<LessonManagementPage />} />
          <Route path="courses/:courseId/preview" element={<CoursePreviewPage />} />
          <Route path="courses/:courseId/lessons" element={<LessonManagementPage />} />
          <Route path="courses/:courseId/lessons/:lessonId" element={<LessonBuilderPage />} />
          <Route path="enrollments" element={<InstructorEnrollmentsPage />} />
          <Route path="enrollments/:enrollmentId" element={<InstructorEnrollmentDetailsPage />} />
          <Route path="students" element={<InstructorStudentsPage />} />
          <Route path="students/:studentId" element={<StudentDetailsPage />} />
          <Route path="analytics" element={<InstructorAnalyticsPage />} />
          <Route path="community" element={<InstructorCommunityListPage />} />
          <Route path="community/:courseId" element={<CommunityManagementPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="messages" element={<InstructorMessagesPage />} />
          <Route path="messages/:conversationId" element={<InstructorConversationPage />} />
          <Route path="profile" element={<InstructorOwnProfilePage />} />
          <Route path="settings" element={<InstructorSettingsPage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="students/:studentId" element={<AdminStudentDetailsPage />} />
          <Route path="instructors" element={<AdminInstructorsPage />} />
          <Route path="instructors/:instructorId" element={<AdminInstructorDetailsPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="courses/:courseId" element={<AdminCourseDetailsPage />} />
          <Route path="disciplines" element={<AdminDisciplinesPage />} />
          <Route path="enrollments" element={<AdminEnrollmentsPage />} />
          <Route path="approvals" element={<AdminApprovalsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="community" element={<AdminCommunityPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
      <DemoRoleSwitcher />
    </BrowserRouter>
  );
}
