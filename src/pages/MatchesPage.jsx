import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
// import { useAuth } from '../auth/AuthProvider.jsx';
import HeaderBar from '../components/dashboard/HeaderBar.jsx';
import BusinessMatches from '../components/dashboard/BusinessMatches.jsx';
import UserSummary from '../components/dashboard/UserSummary.jsx';
import { useToasts } from '../components/dashboard/useToasts.js';
import { PageHeader } from '../components/PremiumComponents';

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: "#f9fafb",
        minHeight: "100vh",
        padding: "24px"
      }}
    >
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {/* Premium Header */}
        <PageHeader
          title="Brand Matches"
          subtitle="Discover partnership opportunities tailored to your profile"
        />

        {/* User AI Summary */}
        <div style={{ marginBottom: "24px" }}>
          <UserSummary />
        </div>

        {/* Progress Overview */}
        <HeaderBar onRefreshMatches={onHeaderRefresh} />
        
        {/* Matches Display */}
        <div ref={matchesRef} />
        <BusinessMatches onRefreshAvailable={handleRefreshAvailable} />
      </div>
    </motion.div>
  );
}