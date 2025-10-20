import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar.jsx';
import { ToastProvider } from '../components/dashboard/Toasts.jsx';
import MyProfilePage from './MyProfilePage.jsx';
import MatchesPage from './MatchesPage.jsx';
import MessagesPage from './MessagesPage.jsx';
import CompliancePage from './CompliancePage.jsx';

export default function DashboardLayout() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg)'
    }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <ToastProvider>
        <main style={{
          flex: 1,
          marginLeft: '280px', // Width of sidebar (will be handled by CSS transition)
          paddingTop: '80px', // Height of navbar
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/profile" replace />} />
            <Route path="/profile" element={<MyProfilePage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
          </Routes>
        </main>
      </ToastProvider>
    </div>
  );
}