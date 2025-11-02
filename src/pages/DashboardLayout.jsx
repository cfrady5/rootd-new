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
      minHeight: 'calc(100dvh - var(--nav-height))',
      background: 'var(--apple-bg)'
    }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <ToastProvider>
        <main style={{
          flex: 1,
          marginLeft: '280px', // Default expanded sidebar width
          padding: 'var(--apple-space-8) var(--apple-space-6)',
          paddingTop: 'calc(88px + var(--apple-space-8))',
          background: 'var(--apple-bg-secondary)',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: 'calc(100dvh - var(--nav-height))',
          overflow: 'auto'
        }}>
          <div className="apple-container" style={{ 
            maxWidth: '1400px',
            padding: 0
          }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard/profile" replace />} />
              <Route path="/profile" element={<MyProfilePage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/compliance" element={<CompliancePage />} />
            </Routes>
          </div>
        </main>
      </ToastProvider>
    </div>
  );
}