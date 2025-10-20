import React, { useState } from 'react';
import { useSocials } from '../../hooks/useSocials';

export default function SocialAnalytics(){
  const { socials, loading, refreshSocial, connectSocial, disconnectSocial, connecting, connectInstagram } = useSocials();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectForm, setConnectForm] = useState({ platform: '', username: '' });
  const [connectError, setConnectError] = useState('');

  const availablePlatforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷', requiresOAuth: true },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
    { id: 'youtube', name: 'YouTube', icon: '📺' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'snapchat', name: 'Snapchat', icon: '👻' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' }
  ];

  const connectedPlatforms = socials?.map(s => s.platform) || [];
  const unconnectedPlatforms = availablePlatforms.filter(p => !connectedPlatforms.includes(p.id));

  async function handleConnect() {
    if (!connectForm.platform) {
      setConnectError('Please select a platform');
      return;
    }

    setConnectError('');

    // Handle Instagram OAuth flow
    if (connectForm.platform === 'instagram') {
      const result = await connectInstagram('personal');
      if (!result.success) {
        setConnectError(result.error || 'Failed to connect Instagram');
      }
      // Don't close modal for Instagram since we're redirecting
      return;
    }

    // Handle other platforms requiring username
    if (!connectForm.username.trim()) {
      setConnectError('Please enter your username');
      return;
    }

    const result = await connectSocial(connectForm.platform, connectForm.username.trim());
    
    if (result.success) {
      setShowConnectModal(false);
      setConnectForm({ platform: '', username: '' });
    } else {
      setConnectError(result.error || 'Failed to connect account');
    }
  }

  async function handleDisconnect(socialId, platform) {
    if (confirm(`Are you sure you want to disconnect your ${platform} account?`)) {
      await disconnectSocial(socialId);
    }
  }

  const selectedPlatform = availablePlatforms.find(p => p.id === connectForm.platform);
  const requiresUsername = selectedPlatform && !selectedPlatform.requiresOAuth;
  
  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-xl)',
      border: '1px solid var(--hair)',
      boxShadow: 'var(--shadow-md)',
      marginBottom: 'var(--space-xl)'
    }} aria-label="Social analytics">
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-lg)'
      }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--ink)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)'
        }}>
          📊 Social Analytics
        </h2>
        <button 
          onClick={() => setShowConnectModal(true)}
          style={{
            background: 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(44, 95, 52, 0.3)'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(44, 95, 52, 0.4)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(44, 95, 52, 0.3)';
          }}
        >
          + Connect Platform
        </button>
      </div>
      
      {/* Social Platforms */}
      <div style={{
        display: 'grid',
        gap: 'var(--space-lg)'
      }}>
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'var(--space-xl)',
            color: 'var(--muted)',
            fontSize: '17px',
            fontWeight: '500'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid var(--hair)',
              borderTop: '2px solid var(--green)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: 'var(--space-sm)'
            }} />
            Loading social data...
          </div>
        )}
        
        {socials?.slice(0,3).map(s => (
          <div key={s.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-lg)',
            background: 'var(--bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--hair)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.target.style.background = 'white';
            e.target.style.boxShadow = 'var(--shadow-sm)';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'var(--bg)';
            e.target.style.boxShadow = 'none';
          }}>
            
            {/* Platform Info */}
            <div style={{ flex: '1' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>
                  {s.platform === 'instagram' ? '📷' : 
                   s.platform === 'twitter' ? '🐦' : 
                   s.platform === 'youtube' ? '📺' : 
                   s.platform === 'tiktok' ? '🎵' : '📱'}
                </span>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'var(--ink)',
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {s.platform}
                </h3>
                <span style={{
                  fontSize: '14px',
                  color: 'var(--muted)',
                  fontWeight: '500'
                }}>
                  @{s.username}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)'
              }}>
                <div style={{
                  color: 'var(--muted)',
                  fontSize: '15px',
                  fontWeight: '500'
                }}>
                  <span style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: 'var(--ink)' 
                  }}>
                    {(s.followers ?? 0).toLocaleString()}
                  </span> followers
                </div>
                {s.followers > 0 && (
                  <div style={{
                    background: 'var(--green)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Connected
                  </div>
                )}
                {s.followers === 0 && (
                  <div style={{
                    background: 'var(--muted)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Sync needed
                  </div>
                )}
              </div>
            </div>
            
            {/* Sparkline Chart */}
            <div style={{
              width: '200px',
              height: '60px',
              background: 'linear-gradient(135deg, rgba(44, 95, 52, 0.05) 0%, rgba(44, 95, 52, 0.1) 100%)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 var(--space-lg)',
              border: '1px solid rgba(44, 95, 52, 0.1)'
            }}>
              {s.followers > 0 ? (
                <svg width="160" height="40" viewBox="0 0 160 40">
                  <path
                    d="M10,30 Q40,10 80,20 T150,15"
                    stroke="var(--green)"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.8"
                  />
                  <circle cx="150" cy="15" r="3" fill="var(--green)" />
                </svg>
              ) : (
                <div style={{
                  color: 'var(--muted)',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  Click Refresh to<br/>sync analytics
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button 
                onClick={() => refreshSocial(s.platform)}
                disabled={s.refreshing}
                style={{
                  background: 'white',
                  color: 'var(--muted)',
                  border: '1px solid var(--hair)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: s.refreshing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: s.refreshing ? 0.5 : 1
                }}
                onMouseEnter={e => {
                  if (!s.refreshing) {
                    e.target.style.borderColor = 'var(--green)';
                    e.target.style.color = 'var(--green)';
                    e.target.style.background = 'rgba(44, 95, 52, 0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!s.refreshing) {
                    e.target.style.borderColor = 'var(--hair)';
                    e.target.style.color = 'var(--muted)';
                    e.target.style.background = 'white';
                  }
                }}
              >
                {s.refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
              </button>
              
              <button 
                onClick={() => handleDisconnect(s.id, s.platform)}
                style={{
                  background: 'white',
                  color: '#ff6b6b',
                  border: '1px solid #ff6b6b',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.target.style.background = '#ff6b6b';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#ff6b6b';
                }}
              >
                🗑️ Disconnect
              </button>
            </div>
          </div>
        ))}
        
        {/* Empty State */}
        {!loading && (!socials || socials.length === 0) && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-xxl)',
            color: 'var(--muted)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>📱</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--ink)',
              margin: '0 0 8px 0'
            }}>
              Connect your social accounts
            </h3>
            <p style={{
              fontSize: '15px',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Track your social media performance and discover partnership opportunities
            </p>
          </div>
        )}
      </div>

      {/* Connect Platform Modal */}
      {showConnectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowConnectModal(false);
            setConnectForm({ platform: '', username: '' });
            setConnectError('');
          }
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-xl)',
            maxWidth: '500px',
            width: '90%',
            boxShadow: 'var(--shadow-xl)',
            animation: 'fadeUp 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-lg)'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--ink)',
                margin: 0
              }}>
                Connect Social Platform
              </h3>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setConnectForm({ platform: '', username: '' });
                  setConnectError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            {connectError && (
              <div style={{
                background: 'rgba(255, 69, 58, 0.1)',
                border: '1px solid rgba(255, 69, 58, 0.2)',
                color: '#ff453a',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-lg)',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ⚠️ {connectError}
              </div>
            )}

            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--ink)',
                marginBottom: 'var(--space-sm)',
                display: 'block'
              }}>
                Select Platform
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 'var(--space-sm)'
              }}>
                {unconnectedPlatforms.map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => setConnectForm(prev => ({ ...prev, platform: platform.id }))}
                    style={{
                      padding: 'var(--space-md)',
                      border: connectForm.platform === platform.id 
                        ? '2px solid var(--green)' 
                        : '1px solid var(--hair)',
                      borderRadius: 'var(--radius-md)',
                      background: connectForm.platform === platform.id 
                        ? 'rgba(44, 95, 52, 0.05)' 
                        : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{platform.icon}</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: connectForm.platform === platform.id ? 'var(--green)' : 'var(--ink)'
                    }}>
                      {platform.name}
                    </span>
                    {platform.requiresOAuth && (
                      <span style={{
                        fontSize: '10px',
                        color: 'var(--muted)',
                        fontWeight: '500'
                      }}>
                        OAuth
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {requiresUsername && (
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <label style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--ink)',
                  marginBottom: 'var(--space-sm)',
                  display: 'block'
                }}>
                  Username (without @)
                </label>
                <input
                  type="text"
                  value={connectForm.username}
                  onChange={(e) => setConnectForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  style={{
                    width: '100%',
                    padding: 'var(--space-md)',
                    border: '1px solid var(--hair)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--hair)'}
                />
              </div>
            )}

            {selectedPlatform?.requiresOAuth && (
              <div style={{
                background: 'rgba(44, 95, 52, 0.05)',
                border: '1px solid rgba(44, 95, 52, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                marginBottom: 'var(--space-xl)'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--ink)',
                  margin: '0 0 8px',
                  fontWeight: '500'
                }}>
                  🔒 Secure OAuth Connection
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--muted)',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  You'll be redirected to {selectedPlatform.name} to securely authorize access to your account data.
                </p>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: 'var(--space-md)',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setConnectForm({ platform: '', username: '' });
                  setConnectError('');
                }}
                style={{
                  background: 'white',
                  color: 'var(--muted)',
                  border: '1px solid var(--hair)',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={connecting || !connectForm.platform || (requiresUsername && !connectForm.username.trim())}
                style={{
                  background: connecting || !connectForm.platform || (requiresUsername && !connectForm.username.trim())
                    ? 'var(--muted)' 
                    : 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: connecting || !connectForm.platform || (requiresUsername && !connectForm.username.trim()) 
                    ? 'not-allowed' 
                    : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)'
                }}
              >
                {connecting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Connecting...
                  </>
                ) : (
                  <>
                    {selectedPlatform?.requiresOAuth ? '🔒' : '🔗'} 
                    {selectedPlatform?.requiresOAuth 
                      ? `Connect with ${selectedPlatform.name}` 
                      : 'Connect Account'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
