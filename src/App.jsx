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

                {/* Auth route */}
                <Route element={<PrivateRoute />}>
                  <Route path="/Student" element={<MainScreen />}>
                    <Route path="demo" element={<DemoPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="notification" element={<Notification />} />
                    <Route path="schedule" element={<SchedulePage />} />
                  </Route>
                  <Route path="/Administrator" element={<MainScreen />}>
                    <Route path="demo" element={<DemoPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="notification" element={<Notification />} />
                  </Route>
                  <Route path="/Lecturer" element={<MainScreen />}>
                    <Route path="demo" element={<DemoPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="notification" element={<Notification />} />
                  </Route>
                  <Route path="/Officer" element={<MainScreen />}>
                    <Route path="demo" element={<DemoPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="notification" element={<Notification />} />
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
