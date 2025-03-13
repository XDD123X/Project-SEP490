import "./App.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/HomePage";
import HomeLayout from "./components/layouts/HomeLayout";
import { HelmetProvider } from "react-helmet-async";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/Errors/notfound";
import { StoreProvider } from "./services/StoreContext";
import Notfound from "./pages/Errors/notfound";
import LogoutPage from "./pages/LogoutPage";
import PrivateRoute from "./pages/private/PrivateRoute";
import RefrestTokenTest from "./pages/test/RefrestTokenTest";
import { Toaster } from "./components/ui/sonner";
import DemoPage from "./pages/dashboard/DemoPage";
import MainScreen from "./pages/dashboard/MainScreen";
import Notification from "./pages/dashboard/Notification";
import DashboardPage from "./pages/dashboard/admin/Dashboard";
import SchedulePage from "./pages/dashboard/SchedulePage";
import ProfilePage from "./pages/profile/profilePage";
import DemoContentPage from "./pages/DemoContentPage";
import ProfileAccount from "./pages/profile/profile-account";
import ProfileSchedule from "./pages/profile/profile-schedule";
import ProfilePassword from "./pages/profile/profile-password";
import ForgotPassword from "./pages/auth/forgot-password";
import ClassPage from "./pages/class-page/class-page";
import ProfileAvatar from "./pages/profile/profile-avatar";
import SessionAddPage from "./pages/session-page/session-add";
import AccountManagementPage from "./pages/officer/account/account-management";

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
                    <Route path="/my-schedule" element={<SchedulePage />} />
                    <Route path="/my-class" element={<ClassPage />} />

                    {/* Dashboard by Role */}
                    <Route path="/Student">
                      <Route path="demo" element={<DemoPage />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="notification" element={<Notification />} />
                    </Route>
                    <Route path="/Administrator">
                      <Route path="demo" element={<DemoPage />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="notification" element={<Notification />} />
                    </Route>
                    <Route path="/Lecturer">
                      <Route path="demo" element={<DemoPage />} />
                      <Route path="notification" element={<Notification />} />
                    </Route>
                    <Route path="/Officer">
                      <Route path="session/add" element={<SessionAddPage />} />
                      <Route path="account" element={<AccountManagementPage />} />
                      <Route path="demo" element={<DemoPage />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="notification" element={<Notification />} />
                    </Route>

                    {/* Tách riêng Schedule Page */}
                    <Route path="/schedule">
                      <Route path="student" element={<SchedulePage role="student" />} />
                      <Route path="teacher" element={<SchedulePage role="teacher" />} />
                      <Route path="officer" element={<SchedulePage role="officer" />} />
                      <Route path="admin" element={<SchedulePage role="admin" />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<Notfound />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="/test">
                  <Route path="refresh-token" element={<RefrestTokenTest />} />
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
