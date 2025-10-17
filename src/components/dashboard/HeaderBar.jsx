import React from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useAchievements } from '../../hooks/useAchievements';

export default function HeaderBar() {
  const { profile } = useProfile();
  const { achievements } = useAchievements();

  const matchesProposed = 2; // placeholder
  const goalsDone = (achievements || []).length;

  return (
    <header className="dashboard-card" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      borderLeft: '4px solid var(--primary)',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px'
      }}>
        {/* Left Side - Welcome & Info */}
        <div style={{ flex: 1 }}>
          <div style={{
            color: 'var(--secondary)',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            Welcome back 👋
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '8px'
          }}>
            {profile?.full_name || 'Athlete'}
          </div>
          <div style={{
            color: 'var(--secondary)',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Here's your brand partnership dashboard
          </div>
        </div>

        {/* Right Side - Avatar & Score */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          {/* Rootd Score Badge */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #1e4f26 100%)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(44, 95, 52, 0.3)'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '2px'
            }}>
              {Math.round(profile?.rootd_score || 0)}
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              opacity: 0.9,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Rootd Score
            </div>
          </div>

          {/* Profile Avatar */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid var(--border)'
          }}>
            <img 
              src={profile?.avatar_url || '/assets/rootd-logo.png'} 
              alt="Profile" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text)'
            }}>
              Matches Proposed
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--primary)'
            }}>
              {matchesProposed}/10
            </span>
          </div>
          <div style={{
            height: '6px',
            background: 'var(--accent-100)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, (matchesProposed / 10) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary), var(--accent-600))',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text)'
            }}>
              Goals Achieved
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--primary)'
            }}>
              {goalsDone}/10
            </span>
          </div>
          <div style={{
            height: '6px',
            background: 'var(--accent-100)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, (goalsDone / 10) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary), var(--accent-600))',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>
    </header>
  );
}
