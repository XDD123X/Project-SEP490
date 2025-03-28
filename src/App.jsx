import "./App.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage";
import HomeLayout from "./components/layouts/HomeLayout";
import { HelmetProvider } from "react-helmet-async";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/Errors/notfound";
import { StoreProvider } from "./services/StoreContext";
import Notfound from "./pages/Errors/notfound";
import LogoutPage from "./pages/LogoutPage";
import PrivateRoute from "./pages/private/PrivateRoute";
import { Toaster } from "./components/ui/sonner";
import MainScreen from "./pages/dashboard/MainScreen";
import DashboardPage from "./pages/dashboard/admin/Dashboard";
import ProfilePage from "./pages/profile/profilePage";
import ProfileAccount from "./pages/profile/profile-account";
import ProfileSchedule from "./pages/profile/profile-schedule";
import ProfilePassword from "./pages/profile/profile-password";
import ForgotPassword from "./pages/auth/forgot-password";
import ProfileAvatar from "./pages/profile/profile-avatar";
import SessionViewPage from "./pages/dashboard/officer/session/session-view";
import SessionGeneratePage from "./pages/dashboard/officer/session/session-generate";
import StudentSchedulePage from "./pages/dashboard/student/StudentSchedulePage";
import StudentClassPage from "./pages/dashboard/student/class-student-page";
import ClassViewPage from "./pages/dashboard/officer/classroom/class-view-page";
import ClassAddNewPage from "./pages/dashboard/officer/classroom/class-add-page";
import ClassDetailPage from "./pages/dashboard/officer/classroom/class-detail-page";
import ClassAddStudentPage from "./pages/dashboard/officer/classroom/add-student/class-add-student-page";
import RefreshTokenTest from "./pages/test/RefreshTokenTest";
import ProtectedRoute from "./pages/private/ProtectedRoute";
import ClassEditPage from "./pages/dashboard/officer/classroom/class-edit-page";
import ViewStudentManagementPage from "./pages/dashboard/officer/account/view-student-officer-page";
import ViewLecturerManagementPage from "./pages/dashboard/officer/account/view-lecturer-officer-page";
import AddAccountOfficerPage from "./pages/dashboard/officer/account/add-account-page";
import ViewAccountDetail from "./pages/dashboard/officer/account/view-account-detail";
import { EditAccountOfficerPage } from "./pages/dashboard/officer/account/edit-account-page";
import MaintenanceError from "./pages/Errors/Maintenance";
import ViewStudentRequest from "./pages/dashboard/officer/request/view-student-request";
import ViewLecturerRequest from "./pages/dashboard/officer/request/view-lecturer-request";
import ScrollTest from "./pages/test/Scroll";
import LecturerSchedulePage from "./pages/dashboard/lecturer/schedule/LecturerSchedulePage";
import ViewClassLecturerPage from "./pages/dashboard/lecturer/classroom/view-class-lecturer-page";
import ViewClassDetailLecturerPage from "./pages/dashboard/lecturer/classroom/view-detail-class-lecturer-page";
import { ViewAttendanceLecturerPage } from "./pages/dashboard/lecturer/attendance/view-attendance-lecturer";
import ViewAttendanceDetailLecturerPage from "./pages/dashboard/lecturer/attendance/view-attendance-detail-lecturer";
import ViewCourseListpage from "./pages/dashboard/officer/course/view-course-list";
import AddCoursePage from "./pages/dashboard/officer/course/add-course-page";
import CourseDetailPage from "./pages/dashboard/officer/course/detail-course-page";
import CourseEditPage from "./pages/dashboard/officer/course/edit-course-page";
import { useTheme } from "next-themes";
import ViewAttendanceStudentPage from "./pages/dashboard/student/attendance/view-attendance-student";
import ViewAttendanceClassStudentPage from "./pages/dashboard/student/attendance/view-attendance-detail-student";
import AttendanceComplain from "./pages/dashboard/student/attendance/complain-attendance-page";
import NotificationPage from "./pages/notification/view-notification-page";
import AddNotificationPage from "./pages/notification/add-notification";
import ViewNotificationListPage from "./pages/notification/view-notification-page";
import ManageNotificationPage from "./pages/notification/manage/manage-notification-page";
import DetailNotificationManagementPage from "./pages/notification/manage/detail-notification-manage-page";
import EditNotificationManagementPage from "./pages/notification/manage/edit-notification-management-page";
import FirstTimeLoginPage from "./pages/FirstTimeLoginPage";
import ViewRequestByClassLecturerPage from "./pages/dashboard/lecturer/request/view-request-lecturer-page";
import ViewRequestBySessionLecturerPage from "./pages/dashboard/lecturer/request/select-class-request-lecturer-page";
import RequestChangeLecturerPage from "./pages/dashboard/lecturer/request/session-change-request-lecturer-page";

function App() {
  return (
    <>
      <HelmetProvider>
        <StoreProvider>
          <ThemeProvider defaultTheme="light" storageKey="theme">
            <Router>
              <Routes>
                {/* public route */}
                <Route
                  path="/"
                  element={
                    <HomeLayout>
                      <Home />
                    </HomeLayout>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/first-time" element={<FirstTimeLoginPage />} />
                <Route path="/logout" element={<LogoutPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Auth route */}
                <Route element={<PrivateRoute />}>
                  <Route element={<MainScreen />}>
                    {/* Profile */}
                    <Route path="/profile" element={<ProfilePage />}>
                      <Route path="" element={<ProfileAccount />} />
                      <Route path="personal-schedule" element={<ProfileSchedule />} />
                      <Route path="password" element={<ProfilePassword />} />
                      <Route path="avatar" element={<ProfileAvatar />} />
                    </Route>
                    {/* Notification */}
                    <Route path="/notification">
                      <Route index element={<NotificationPage />} />
                      <Route path=":tab" element={<NotificationPage />} />
                      <Route path=":tab/:notificationId" element={<NotificationPage />} />
                      <Route path="list" element={<ManageNotificationPage />} />
                      <Route path="add" element={<AddNotificationPage />} />
                      <Route path="detail/:id" element={<DetailNotificationManagementPage />} />
                      <Route path="edit/:id" element={<EditNotificationManagementPage />} />
                    </Route>
                    {/* account information */}
                    <Route path="account/:id" element={<ViewAccountDetail />} />
                    {/* Student Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                      <Route path="/Student">
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="my-schedule" element={<StudentSchedulePage />} />
                        <Route path="my-class" element={<StudentClassPage />} />

                        <Route path="attendance" element={<ViewAttendanceStudentPage />} />
                        <Route path="attendance/class/:id" element={<ViewAttendanceClassStudentPage />} />
                        <Route path="attendance/complain" element={<AttendanceComplain />} />
                      </Route>
                    </Route>
                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["administrator"]} />}>
                      <Route path="/Administrator">
                        <Route path="dashboard" element={<DashboardPage />} />
                      </Route>
                    </Route>
                    {/* Lecturer Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["lecturer"]} />}>
                      <Route path="/Lecturer">
                        <Route path="my-schedule" element={<LecturerSchedulePage />} />

                        <Route path="my-class" element={<ViewClassLecturerPage />} />
                        <Route path="class/detail/:id" element={<ViewClassDetailLecturerPage />} />

                        <Route path="attendance" element={<ViewAttendanceLecturerPage />} />
                        <Route path="attendance/:classId" element={<ViewAttendanceLecturerPage />} />
                        <Route path="attendance/:classId/:sessionId" element={<ViewAttendanceDetailLecturerPage />} />

                        <Route path="request" element={<ViewRequestByClassLecturerPage />} />
                        <Route path="request/:classId" element={<ViewRequestBySessionLecturerPage />} />
                        <Route path="request/:classId/:sessionId" element={<RequestChangeLecturerPage />} />
                      </Route>
                    </Route>
                    {/* Officer Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["officer"]} />}>
                      <Route path="/Officer">
                        <Route path="session" element={<SessionViewPage />} />
                        <Route path="session/generate" element={<SessionGeneratePage />} />

                        <Route path="class" element={<ClassViewPage />} />
                        <Route path="class/add-new" element={<ClassAddNewPage />} />
                        <Route path="class/add-student" element={<ClassAddStudentPage />} />
                        <Route path="class/detail" element={<ClassDetailPage />} />
                        <Route path="class/edit" element={<ClassEditPage />} />

                        <Route path="account/students" element={<ViewStudentManagementPage />} />
                        <Route path="account/lecturers" element={<ViewLecturerManagementPage />} />
                        <Route path="account/add" element={<AddAccountOfficerPage />} />
                        <Route path="account/edit/:id" element={<EditAccountOfficerPage />} />

                        <Route path="course" element={<ViewCourseListpage />} />
                        <Route path="course/add" element={<AddCoursePage />} />
                        <Route path="course/detail/:id" element={<CourseDetailPage />} />
                        <Route path="course/edit/:id" element={<CourseEditPage />} />

                        <Route path="request/student" element={<ViewStudentRequest />} />
                        <Route path="request/lecturer" element={<ViewLecturerRequest />} />

                        <Route path="dashboard" element={<DashboardPage />} />
                      </Route>
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<Notfound />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="/503" element={<MaintenanceError />} />
                <Route path="/test">
                  <Route path="refresh-token" element={<RefreshTokenTest />} />
                  <Route path="scroll" element={<ScrollTest />} />
                </Route>
              </Routes>
            </Router>
            <Toaster richColors position="top-right" expand={true} theme={localStorage.getItem("theme")} visibleToasts={5} duration={6000} />
          </ThemeProvider>
        </StoreProvider>
      </HelmetProvider>
    </>
  );
}

export default App;
