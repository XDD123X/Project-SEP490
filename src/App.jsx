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
import DemoPage from "./pages/dashboard/DemoPage";
import MainScreen from "./pages/dashboard/MainScreen";
import Notification from "./pages/dashboard/Notification";
import DashboardPage from "./pages/dashboard/admin/Dashboard";
import ProfilePage from "./pages/profile/profilePage";
import ProfileAccount from "./pages/profile/profile-account";
import ProfileSchedule from "./pages/profile/profile-schedule";
import ProfilePassword from "./pages/profile/profile-password";
import ForgotPassword from "./pages/auth/forgot-password";
import ProfileAvatar from "./pages/profile/profile-avatar";
import AccountManagementPage from "./pages/dashboard/officer/account/account-management";
import SessionViewPage from "./pages/dashboard/officer/session-page/session-view";
import SessionGeneratePage from "./pages/dashboard/officer/session-page/session-generate";
import LecturerSchedulePage from "./pages/dashboard/lecturer/LecturerSchedulePage";
import StudentSchedulePage from "./pages/dashboard/student/StudentSchedulePage";
import StudentClassPage from "./pages/dashboard/student/class-student-page";
import ClassViewPage from "./pages/dashboard/officer/classroom/class-view-page";
import ClassAddNewPage from "./pages/dashboard/officer/classroom/class-add-page";
import ClassDetailPage from "./pages/dashboard/officer/classroom/class-detail-page";
import ClassAddStudentPage from "./pages/dashboard/officer/classroom/add-student/class-add-student-page";
import RefreshTokenTest from "./pages/test/RefreshTokenTest";
import ProtectedRoute from "./pages/private/ProtectedRoute";
import ClassEditPage from "./pages/dashboard/officer/classroom/class-edit-page";

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

                    <Route path="/notification" element={<Notification />} />

                    {/* Dashboard by Role */}
                    <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                      <Route path="/Student">
                        <Route path="demo" element={<DemoPage />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="notification" element={<Notification />} />
                        <Route path="my-schedule" element={<StudentSchedulePage />} />
                        <Route path="my-class" element={<StudentClassPage />} />
                      </Route>
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={["administrator"]} />} >
                      <Route path="/Administrator">
                        <Route path="demo" element={<DemoPage />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="notification" element={<Notification />} />
                      </Route>
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={["lecturer"]} />}>
                      <Route path="/Lecturer">
                        <Route path="demo" element={<DemoPage />} />
                        <Route path="notification" element={<Notification />} />
                        <Route path="my-schedule" element={<LecturerSchedulePage />} />
                      </Route>
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={["officer"]} />}>
                      <Route path="/Officer">
                        <Route path="session" element={<SessionViewPage />} />
                        <Route path="session/generate" element={<SessionGeneratePage />} />

                        <Route path="class" element={<ClassViewPage />} />
                        <Route path="class/add-new" element={<ClassAddNewPage />} />
                        <Route path="class/add-student" element={<ClassAddStudentPage />} />
                        <Route path="class/detail" element={<ClassDetailPage />} />
                        <Route path="class/edit" element={<ClassEditPage />} />

                        <Route path="account" element={<AccountManagementPage />} />
                        <Route path="demo" element={<DemoPage />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="notification" element={<Notification />} />
                      </Route>
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<Notfound />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="/test">
                  <Route path="refresh-token" element={<RefreshTokenTest />} />
                </Route>
              </Routes>
            </Router>
            <Toaster richColors position="top-right" expand={false} theme="light" />
          </ThemeProvider>
        </StoreProvider>
      </HelmetProvider>
    </>
  );
}

export default App;
