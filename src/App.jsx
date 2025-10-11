// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import HomePage from "./pages/HomePage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DemoPage from "./pages/DemoPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import DirectorPortal from "./pages/DirectorPortal.jsx";
import { useAuth } from "./auth/useAuth.js";

function ProtectedRoute({ children }) {
  const auth = useAuth(); // may be undefined while provider mounts
  // If provider not ready yet, show a tiny splash
  if (!auth || auth.loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "40vh" }}>
        <div className="subtle">Loading…</div>
      </div>
    );
  }
  // No session? send to login
  if (!auth.session) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/director" element={<DirectorPortal />} />

          {/* Auth */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />

          {/* Protected */}
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
