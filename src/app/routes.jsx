import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './RootLayout.jsx';
import DashboardPage from '../features/dashboard/DashboardPage.jsx';
import QuizPage from '../features/quiz/QuizPage.jsx';
// Legacy pages to render within RootLayout for consistency
import HomePage from '../pages/HomePage.jsx';
import DemoPage from '../pages/DemoPage.jsx';
import AboutPage from '../pages/AboutPage.jsx';
import PricingPage from '../pages/PricingPage.jsx';
import DirectorPortal from '../pages/DirectorPortal.jsx';
import DirectorLayout from '../pages/DirectorLayout.jsx';
import Login from '../pages/Login.jsx';
import Signup from '../pages/Signup.jsx';
import Profile from '../pages/Profile.jsx';
import DashboardLayout from '../pages/DashboardLayout.jsx';
import InstagramCallback from '../components/InstagramCallback.jsx';

function ProtectedRoute({ children }){
  // Minimal pass-through; wire to real auth later
  return children;
}

const wrap = (node) => <RootLayout>{node}</RootLayout>;

export default function AppRoutes(){
  return (
    <Routes>
      {/* Marketing */}
      <Route path="/" element={wrap(<HomePage/>)} />
      <Route path="/demo" element={wrap(<DemoPage/>)} />
      <Route path="/about" element={wrap(<AboutPage/>)} />
      <Route path="/pricing" element={wrap(<PricingPage/>)} />

      {/* Auth */}
      <Route path="/login" element={wrap(<Login/>)} />
      <Route path="/signup" element={wrap(<Signup/>)} />

      {/* Quiz and Dashboard (new unified) */}
      <Route path="/quiz" element={<ProtectedRoute>{wrap(<QuizPage/>)}</ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute>{wrap(<DashboardPage/>)}</ProtectedRoute>} />

      {/* Legacy dashboard tree wrapped for consistent UI */}
      <Route path="/dashboard/*" element={<ProtectedRoute>{wrap(<DashboardLayout/>)}</ProtectedRoute>} />

      {/* Director Portal and Layout */}
      <Route path="/director-portal" element={<ProtectedRoute>{wrap(<DirectorPortal/>)}</ProtectedRoute>} />
      <Route path="/director/*" element={<ProtectedRoute>{wrap(<DirectorLayout/>)}</ProtectedRoute>} />

      {/* OAuth Callback */}
      <Route path="/auth/instagram/callback" element={<ProtectedRoute>{wrap(<InstagramCallback/>)}</ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}