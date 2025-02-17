import "./App.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/HomePage";
import HomeLayout from "./components/layouts/HomeLayout";
import { HelmetProvider } from "react-helmet-async";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/layouts/Layout";
import TestForm from "./pages/TestPage";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";
import NotFound from "./pages/Errors/notfound";
import { StoreProvider } from "./services/StoreContext";
import StudentPrivateRoute from "./pages/private/StudentPrivateRoute";
import LecturerPrivateRoute from "./pages/private/LecturerPrivateRoute";
import OfficerPrivateRoute from "./pages/private/OfficerPrivateRoute";
import AdminPrivateRoute from "./pages/private/AdminPrivateRoute";
import LecturerDashboard from "./pages/dashboard/lecturer/LecturerDashboard";
import StudentDashboard from "./pages/dashboard/student/StudentDashboard";
import OfficerDashboard from "./pages/dashboard/officer/OfficerDashboard";
import Notfound from "./pages/Errors/notfound";
import LogoutPage from "./pages/LogoutPage";
import PrivateRoute from "./pages/private/PrivateRoute";
import DemoPage from "./pages/dashboard/admin/DemoPage";
import RefrestTokenTest from "./pages/test/RefrestTokenTest";
import { Toaster } from "./components/ui/sonner";

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

                {/* auth route */}
                <Route element={<PrivateRoute />}>
                  {/* student route */}
                  <Route element={<StudentPrivateRoute />}>
                    <Route path="/Student" element={<StudentDashboard />} />
                  </Route>
                  {/* lecturer route */}
                  <Route element={<LecturerPrivateRoute />}>
                    <Route path="/Lecturer" element={<LecturerDashboard />} />
                  </Route>
                  {/* officer route */}
                  <Route element={<OfficerPrivateRoute />}>
                    <Route path="/Officer" element={<OfficerDashboard />} />
                  </Route>
                  {/* admin route */}
                  <Route element={<AdminPrivateRoute />}>
                    <Route path="/Administrator" element={<AdminDashboard />}>
                      <Route path="demo" element={<DemoPage />} />
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
            <Toaster richColors position="top-right" expand={false} theme="light"/>
          </ThemeProvider>
        </StoreProvider>
      </HelmetProvider>
    </>
  );
}

export default App;
