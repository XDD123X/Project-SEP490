import "./App.css";
import React, { useContext } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/HomePage";
import HomeLayout from "./components/layouts/HomeLayout";
import { HelmetProvider } from "react-helmet-async";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/layouts/Layout";
import TestForm from "./pages/TestPage";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";

function App() {
  return (
    <>
      <HelmetProvider>
        <ThemeProvider defaultTheme="light" storageKey="theme">
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <HomeLayout>
                    <Home />F
                  </HomeLayout>
                }
              />

              <Route
                path="/login"
                element={
                  <Layout>
                    <LoginPage />
                  </Layout>
                }
              />
              <Route
                path="/test-form"
                element={
                  <Layout>
                    <TestForm />
                  </Layout>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </HelmetProvider>
    </>
  );
}

export default App;
