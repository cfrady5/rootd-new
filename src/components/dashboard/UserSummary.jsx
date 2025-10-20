import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider.jsx';
import { generateUserSummary } from '../../lib/api.js';

export default function UserSummary() {
  const { session, supabase } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session || !supabase) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        console.log('UserSummary: Fetching summary...');
        const result = await generateUserSummary(supabase);
        console.log('UserSummary: Got result:', result);
        setSummary(result);
        setError(null);
      } catch (err) {
        console.error('UserSummary: Error fetching user summary:', err);
        // Check if it's a missing quiz error
        if (err.message?.includes('No quiz data')) {
          setError('MISSING_QUIZ');
        } else if (err.message?.includes('Missing OPENAI_API_KEY')) {
          setError('AI summary service is temporarily unavailable.');
        } else {
          setError('Unable to generate summary. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [session, supabase]);

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, var(--green) 0%, #22c55e 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        marginBottom: 'var(--space-xl)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            animation: 'pulse 2s infinite'
          }}>
            ✨
          </div>
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              margin: '0 0 8px 0'
            }}>
              Generating Your Athlete Summary...
            </h3>
            <div style={{
              fontSize: '15px',
              opacity: 0.9,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '4px 12px',
              display: 'inline-block'
            }}>
              AI is analyzing your quiz results
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // Special handling for missing quiz
    if (error === 'MISSING_QUIZ') {
      return (
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xl)',
          marginBottom: 'var(--space-xl)',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              📋
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                margin: '0 0 8px 0'
              }}>
                Take the Quiz to Get Your Summary
              </h3>
              <p style={{
                fontSize: '15px',
                margin: '0 0 16px 0',
                opacity: 0.9,
                lineHeight: '1.5'
              }}>
                Complete the athlete quiz to generate your personalized AI summary that shows brands what makes you unique as a partnership opportunity.
              </p>
              <a
                href="/quiz"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📋 Take the Quiz
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Other errors
    return (
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        marginBottom: 'var(--space-xl)',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            ⚠️
          </div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              margin: '0 0 8px 0'
            }}>
              Unable to Generate Summary
            </h3>
            <p style={{
              fontSize: '14px',
              margin: '0 0 12px 0',
              opacity: 0.9
            }}>
              There was an issue generating your summary.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--green) 0%, #22c55e 100%)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-xl)',
      marginBottom: 'var(--space-xl)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-lg)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0
          }}>
            ⭐
          </div>
          
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '22px',
              fontWeight: '700',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)'
            }}>
              Your Athlete Profile
              {summary.rootd_score && (
                <span style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Score: {summary.rootd_score}
                </span>
              )}
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0 0 16px 0',
              opacity: 0.95
            }}>
              {summary.summary}
            </p>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-md)',
              flexWrap: 'wrap'
            }}>
              {summary.last_quiz_date ? (
                <div style={{
                  fontSize: '13px',
                  opacity: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)'
                }}>
                  <span>📅</span>
                  Quiz taken: {new Date(summary.last_quiz_date).toLocaleDateString()}
                </div>
              ) : (
                <div style={{
                  fontSize: '13px',
                  opacity: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)'
                }}>
                  <span>✨</span>
                  Demo summary - take quiz for personalized results
                </div>
              )}
              
              {summary.is_demo && (
                <a
                  href="/quiz"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    textDecoration: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  Take Quiz
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Top Business Rankings */}
        {summary.top_matches && summary.top_matches.length > 0 && (
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: 'var(--space-lg)',
            marginTop: 'var(--space-lg)'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '700',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)'
            }}>
              🏆 Top Business Matches
            </h4>
            
            <div style={{
              display: 'grid',
              gap: 'var(--space-sm)',
              fontSize: '14px'
            }}>
              {summary.top_matches.slice(0, 3).map((match, index) => {
                const matchScore = match.match_score || 0;
                const displayScore = matchScore < 1 ? Math.round(matchScore * 100) : Math.round(matchScore);
                
                return (
                  <div
                    key={match.business_place_id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <span style={{
                        fontWeight: '700',
                        fontSize: '16px',
                        color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                      }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                      <div>
                        <div style={{ fontWeight: '600' }}>
                          {match.business_name || 'Local Business'}
                        </div>
                        {match.category && (
                          <div style={{ fontSize: '12px', opacity: 0.8 }}>
                            {match.category}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {displayScore}% match
                    </div>
                  </div>
                );
              })}
            </div>
            
            {summary.top_matches.length > 3 ? (
              <div style={{
                textAlign: 'center',
                marginTop: 'var(--space-sm)'
              }}>
                <a
                  href="#matches"
                  onClick={(e) => {
                    e.preventDefault();
                    const matchesSection = document.querySelector('[ref="matchesRef"]') || 
                                         document.querySelector('.business-matches') ||
                                         document.querySelector('#matches');
                    if (matchesSection) {
                      matchesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.opacity = '1'}
                  onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  View all {summary.top_matches.length} matches below ↓
                </a>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                marginTop: 'var(--space-sm)'
              }}>
                <a
                  href="#matches"
                  onClick={(e) => {
                    e.preventDefault();
                    const matchesSection = document.querySelector('[ref="matchesRef"]') || 
                                         document.querySelector('.business-matches') ||
                                         document.querySelector('#matches');
                    if (matchesSection) {
                      matchesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.opacity = '1'}
                  onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Find more matches below ↓
                </a>
              </div>
            )}
          </div>
        )}

        <div style={{
          fontSize: '14px',
          opacity: 0.8,
          fontStyle: 'italic',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          paddingTop: 'var(--space-md)',
          marginTop: 'var(--space-md)'
        }}>
          ✨ This summary is generated based on your quiz responses and helps brands understand your partnership potential
        </div>
      </div>
    </div>
  );
}