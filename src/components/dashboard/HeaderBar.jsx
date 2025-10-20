import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { useAchievements } from '../../hooks/useAchievements';
import supabase from '../../lib/supabaseClient';
import { useToasts } from './useToasts.js';
import { findNewMatches } from '../../lib/api';

export default function HeaderBar({ onRefreshMatches }) {
  const { profile } = useProfile();
  const { achievements } = useAchievements();
  const navigate = useNavigate();
  const [isFindingMatches, setIsFindingMatches] = useState(false);
  const toasts = useToasts?.();

  const matchesProposed = 2; // placeholder
  const goalsDone = (achievements || []).length;
  const score = profile?.rootd_score || 0;

  const handleFindMatches = async (e) => {
    e.preventDefault();
    setIsFindingMatches(true);
    
    try {
      const result = await findNewMatches(supabase);
      console.log('Found new matches:', result);
      try {
        const count = Array.isArray(result?.matches) ? result.matches.length : 0;
        console.log('process-quiz returned matches:', count);
        // Seed UI immediately in case DB write or RLS propagation lags
        localStorage.setItem('rootd_last_matches', JSON.stringify(result.matches || []));
      } catch(_e) { /* ignore localStorage issues */ }
      
      // Success feedback
  const matchCount = result.matches?.length || 0;
  try { toasts?.push?.({ title: `Found ${matchCount} new matches` }); } catch {/* ignore toast errors */}
      if (!toasts) {
        alert(`Successfully found ${matchCount} new matches! Refreshing your dashboard...`);
      }
      
      // Navigate to matches tab
      navigate('/dashboard/matches');
      
      // Use the callback to refresh matches instead of page reload
      if (onRefreshMatches) {
        console.log('Refreshing matches with callback...');
        setTimeout(() => {
          onRefreshMatches();
        }, 150);
      } else {
        console.log('No refresh callback, reloading page...');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error('Error finding matches:', error);
      if (error.message.includes('No quiz data found')) {
        // User hasn't taken the quiz yet
        if (confirm('You need to take the quiz first. Go to quiz now?')) {
          navigate('/quiz');
        }
      } else {
        alert('Failed to find new matches: ' + error.message);
      }
    } finally {
      setIsFindingMatches(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f7 100%)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-xxl)',
      marginBottom: 'var(--space-xl)',
      border: '1px solid var(--hair)',
      boxShadow: 'var(--shadow-lg)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Hero Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-xl)',
        marginBottom: 'var(--space-xl)'
      }}>
        {/* Profile Avatar - Prominent */}
        <div style={{
          width: '88px',
          height: '88px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          border: '4px solid white',
          background: 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          position: 'relative'
        }}>
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Profile" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <span style={{ color: 'white', fontWeight: '700' }}>
              {(profile?.full_name || 'A')[0].toUpperCase()}
            </span>
          )}
          
          {/* Score Badge - Floating */}
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'var(--success)',
            color: 'white',
            borderRadius: '12px',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(48, 209, 88, 0.4)',
            border: '2px solid white'
          }}>
            {Math.round(score)}
          </div>
        </div>

        {/* Welcome Text */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '15px',
            color: 'var(--secondary)',
            fontWeight: '500',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Welcome back
          </div>
          <h1 style={{
            fontSize: '34px',
            fontWeight: '700',
            color: 'var(--ink)',
            margin: 0,
            lineHeight: '1.1',
            marginBottom: '8px'
          }}>
            {profile?.full_name || 'Athlete'}
          </h1>
          <p style={{
            fontSize: '17px',
            color: 'var(--muted)',
            margin: 0,
            fontWeight: '400'
          }}>
            Your brand partnership dashboard
          </p>
        </div>

        {/* Action Button - CTA */}
        <button
          onClick={handleFindMatches}
          disabled={isFindingMatches}
          style={{
          background: isFindingMatches 
            ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
            : 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 32px',
          fontSize: '17px',
          fontWeight: '600',
          cursor: isFindingMatches ? 'not-allowed' : 'pointer',
          boxShadow: '0 6px 20px rgba(44, 95, 52, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          opacity: isFindingMatches ? 0.7 : 1
        }}
        onMouseEnter={e => {
          if (!isFindingMatches) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 30px rgba(44, 95, 52, 0.4)';
          }
        }}
        onMouseLeave={e => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 6px 20px rgba(44, 95, 52, 0.3)';
        }}>
          <span>{isFindingMatches ? '⏳' : '🎯'}</span>
          {isFindingMatches ? 'Finding Matches...' : 'Find New Matches'}
        </button>
      </div>

      {/* Progress Section - Elegant */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-xl)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.5)'
      }}>
        {/* Matches Progress */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--ink)'
            }}>
              Matches This Month
            </span>
            <span style={{
              fontSize: '13px',
              fontWeight: '700',
              color: 'var(--green)',
              background: 'rgba(44, 95, 52, 0.1)',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              {matchesProposed}/10
            </span>
          </div>
          <div style={{
            height: '8px',
            background: 'rgba(44, 95, 52, 0.1)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, (matchesProposed / 10) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--green), var(--green-light))',
              borderRadius: '4px',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
        </div>

        {/* Goals Progress */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--ink)'
            }}>
              Goals Completed
            </span>
            <span style={{
              fontSize: '13px',
              fontWeight: '700',
              color: 'var(--success)',
              background: 'rgba(48, 209, 88, 0.1)',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              {goalsDone}/10
            </span>
          </div>
          <div style={{
            height: '8px',
            background: 'rgba(48, 209, 88, 0.1)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, (goalsDone / 10) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--success), #00d4aa)',
              borderRadius: '4px',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
        </div>
      </div>

      {/* Subtle background decoration */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(135deg, rgba(44, 95, 52, 0.03), rgba(52, 208, 88, 0.05))',
        borderRadius: '50%',
        transform: 'translate(50%, -50%)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}
