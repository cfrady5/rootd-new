// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import HomePage from "./pages/HomePage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import DashboardLayout from "./pages/DashboardLayout.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import DemoPage from "./pages/DemoPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import DirectorPortal from "./pages/DirectorPortal.jsx";
import DirectorDashboard from "./pages/DirectorDashboard.jsx";
import DirectorLayout from "./pages/DirectorLayout.jsx";
import {
  OverviewPage,
  DealsPage,
  AthletesPage,
  BrandsPage,
  CompliancePage,
  FinancePage,
  TasksPage,
  SettingsPage
} from "./pages/director/index.js";
import InstagramCallback from "./components/InstagramCallback.jsx";
import { useAuth } from "./auth/AuthProvider.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import RequireRole from "./auth/RequireRole.jsx";

function ProtectedRoute({ children }) {
  const auth = useAuth(); // may be undefined while provider mounts
  // If provider not ready yet, show a tiny splash
  if (!auth || auth.loading) {
    return <LoadingScreen message="Loading your profile..." fullScreen={false} />;
  }
  // No session? send to login
  if (!auth.session) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/director-portal" element={<DirectorPortal />} />
          
          {/* Director Dashboard with nested routes */}
          <Route 
            path="/director/*" 
            element={
              <ProtectedRoute>
                <DirectorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/director/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="athletes" element={<AthletesPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="compliance" element={<CompliancePage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* OAuth Callbacks */}
          <Route 
            path="/auth/instagram/callback" 
            element={
              <ProtectedRoute>
                <InstagramCallback />
              </ProtectedRoute>
            } 
          />

          {/* Protected */}
          <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
