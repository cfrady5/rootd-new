import React, { useState, useCallback, useRef } from 'react';
// import { useAuth } from '../auth/AuthProvider.jsx';
import HeaderBar from '../components/dashboard/HeaderBar.jsx';
import MetricCards from '../components/dashboard/MetricCards.jsx';
import BusinessMatches from '../components/dashboard/BusinessMatches.jsx';
import UserSummary from '../components/dashboard/UserSummary.jsx';
import { useToasts } from '../components/dashboard/useToasts.js';

export default function MatchesPage() {
  // const { session } = (useAuth?.() ?? {});
  const [refreshMatchesFn, setRefreshMatchesFn] = useState(null);
  const pendingRefresh = useRef(false);
  const matchesRef = useRef(null);
  const toasts = useToasts?.();
  
  // Callback to capture refresh function from BusinessMatches
  const handleRefreshAvailable = useCallback((refreshFn) => {
    setRefreshMatchesFn(() => refreshFn);
    // If a refresh was requested before the function was available, run it now
    if (pendingRefresh.current && typeof refreshFn === 'function') {
      pendingRefresh.current = false;
      try { refreshFn(); } catch (e) { console.error('Deferred refresh failed:', e); }
    }
  }, []);

  // Stable callback passed to HeaderBar so clicking "Find New Matches" always triggers a refresh
  const onHeaderRefresh = useCallback(() => {
    if (typeof refreshMatchesFn === 'function') {
      const p = refreshMatchesFn();
      // After refresh completes, scroll into view and toast
      Promise.resolve(p).then(() => {
        try {
          matchesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch {/* ignore scroll errors */}
        try {
          toasts?.push?.({ title: 'Matches updated' });
        } catch {/* ignore toast errors */}
      });
      return p;
    }
    // If not yet available, mark as pending; it will run in handleRefreshAvailable
    pendingRefresh.current = true;
  }, [refreshMatchesFn, toasts]);
  
  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <div style={{
          marginBottom: 'var(--space-xl)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: 'var(--ink)',
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em'
          }}>
            Brand Matches
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--muted)',
            margin: 0,
            fontWeight: '500'
          }}>
            Discover partnership opportunities tailored to your profile
          </p>
        </div>

        {/* User AI Summary */}
        <UserSummary />

        {/* Progress Overview */}
        <HeaderBar onRefreshMatches={onHeaderRefresh} />
        
        {/* Match Metrics */}
        <MetricCards />
        
        {/* Matches Display */}
        <div ref={matchesRef} />
        <BusinessMatches onRefreshAvailable={handleRefreshAvailable} />
      </div>
    </div>
  );
}