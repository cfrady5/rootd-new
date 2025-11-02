// /src/pages/DirectorPortal.jsx
import React, { useEffect, useState, useCallback } from "react";
import supabase from "../lib/supabaseClient.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import FooterCTA from "../components/FooterCTA.jsx";

export default function DirectorPortal() {
  const { session } = (useAuth?.() ?? {});
  const [orgs, setOrgs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchOrgs = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("orgs")
        .select("id,name")
        .order("name", { ascending: true });
      if (err) throw err;
      setOrgs(data || []);
    } catch (e) {
      setError(e.message || "Failed to load orgs.");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  if (!session?.user) {
    return (
      <div className="page-container" style={{ 
        background: 'var(--bg-primary)',
  minHeight: 'calc(100dvh - var(--nav-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: 'var(--space-2xl)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--hair)',
          boxShadow: 'var(--shadow-xl)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>🔒</div>
          <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: '700', color: 'var(--ink)' }}>
            Authentication Required
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-lg)' }}>
            Please log in to access the Director Portal
          </p>
          <a 
            href="/login" 
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: 'var(--green)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ 
      background: 'var(--bg-primary)',
  minHeight: 'calc(100dvh - var(--nav-height))',
      paddingTop: 'var(--space-2xl)'
    }}>
      <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-xl)' }}>
        
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-2xl)',
          border: '1px solid var(--hair)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 'var(--space-xl)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <div>
              <h1 style={{ 
                margin: '0 0 8px', 
                fontSize: '32px', 
                fontWeight: '700',
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span>📊</span> Director Portal
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '16px', margin: 0 }}>
                Manage your athletic organizations and compliance
              </p>
            </div>
            <button 
              onClick={fetchOrgs} 
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? 'var(--muted)' : 'var(--green)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={e => !loading && (e.target.style.opacity = '0.9')}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Loading...
                </>
              ) : (
                <>🔄 Refresh</>
              )}
            </button>
          </div>

          {/* User Info */}
          <div style={{
            padding: 'var(--space-lg)',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--hair)'
          }}>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px', fontWeight: '500' }}>
              Logged in as
            </div>
            <div style={{ fontWeight: '600', color: 'var(--ink)' }}>
              {session.user.email}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ 
            marginBottom: 'var(--space-xl)', 
            padding: 'var(--space-lg)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            borderRadius: 'var(--radius-lg)', 
            background: 'rgba(254, 226, 226, 0.5)', 
            color: '#B91C1C',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>Error Loading Organizations</div>
              <div style={{ fontSize: '14px' }}>{error}</div>
            </div>
          </div>
        )}

        {/* Organizations Section */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--hair)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          marginBottom: 'var(--space-xl)'
        }}>
          <div style={{ 
            padding: 'var(--space-xl)', 
            borderBottom: '1px solid var(--hair)',
            background: 'var(--bg-primary)'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '700',
              color: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🏛️</span> Your Organizations
            </h3>
          </div>
          <div style={{ padding: 'var(--space-xl)' }}>
            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: 'var(--space-2xl)',
                color: 'var(--muted)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--hair)',
                  borderTop: '3px solid var(--green)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}></div>
                Loading organizations...
              </div>
            ) : orgs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-2xl)',
                color: 'var(--muted)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>📭</div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  No Organizations Found
                </div>
                <div style={{ fontSize: '14px' }}>
                  Contact your administrator to get set up
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                {orgs.map((org) => (
                  <div
                    key={org.id}
                    style={{
                      padding: 'var(--space-lg)',
                      background: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--hair)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--green)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--hair)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'var(--green)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        🏛️
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--ink)', marginBottom: '2px' }}>
                          {org.name || "Unnamed Organization"}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                          ID: {org.id.slice(0, 8)}...
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: '#16A34A',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Active
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Platform Status */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          border: '1px solid var(--hair)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h3 style={{ 
            margin: '0 0 16px', 
            fontSize: '20px', 
            fontWeight: '700',
            color: 'var(--ink)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚙️</span> Platform Status
          </h3>
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            <div style={{
              padding: 'var(--space-md)',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>✅</span>
              <div>
                <div style={{ fontWeight: '600', color: '#16A34A' }}>Matching Enabled</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Athletes can discover and connect with businesses
                </div>
              </div>
            </div>
            <div style={{
              padding: 'var(--space-md)',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>✅</span>
              <div>
                <div style={{ fontWeight: '600', color: '#16A34A' }}>Compliance Monitoring Active</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  All partnerships are tracked and reviewed
                </div>
              </div>
            </div>
            <div style={{
              padding: 'var(--space-md)',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>✅</span>
              <div>
                <div style={{ fontWeight: '600', color: '#16A34A' }}>Dashboard Operational</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Real-time analytics and reporting available
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      {/* Footer CTA */}
      <FooterCTA />
    </div>
  );
}
