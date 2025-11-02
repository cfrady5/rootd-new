import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './RootLayout.jsx';
import DashboardPage from '../features/dashboard/DashboardPage.jsx';
import QuizPage from '../features/quiz/QuizPage.jsx';

function ProtectedRoute({ children }){
  // Minimal pass-through; wire to real auth later
  return children;
}

const Landing = () => (
  <RootLayout>
    <h1 style={{marginTop:0}}>Welcome</h1>
    <p>Rootd unified layout stub.</p>
  </RootLayout>
);

export default function AppRoutes(){
  return (
    <Routes>
      <Route path="/" element={<Landing/>} />
      <Route path="/quiz" element={<ProtectedRoute><QuizPage/></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}