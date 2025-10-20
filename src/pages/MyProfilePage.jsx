import React from 'react';
import ProfileOverview from '../components/dashboard/ProfileOverview.jsx';
import SocialAnalytics from '../components/dashboard/SocialAnalytics.jsx';

export default function MyProfilePage() {
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
            My Profile
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--muted)',
            margin: 0,
            fontWeight: '500'
          }}>
            Manage your athlete profile and social presence
          </p>
        </div>

        {/* Profile Management */}
        <ProfileOverview />
        
        {/* Social Media Analytics */}
        <SocialAnalytics />
        
        {/* Additional Profile Settings */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xl)',
          border: '1px solid var(--hair)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 'var(--space-xl)'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--ink)',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            ⚙️ Profile Settings
          </h2>
          
          <div style={{
            display: 'grid',
            gap: 'var(--space-lg)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            
            {/* Visibility Settings */}
            <div style={{
              padding: 'var(--space-lg)',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--hair)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--ink)',
                margin: '0 0 12px 0'
              }}>
                Profile Visibility
              </h3>
              <p style={{
                fontSize: '15px',
                color: 'var(--muted)',
                margin: '0 0 16px 0',
                lineHeight: '1.5'
              }}>
                Control who can see your profile and contact you for partnerships
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: 'var(--ink)',
                  cursor: 'pointer'
                }}>
                  <input type="checkbox" defaultChecked style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--green)'
                  }} />
                  Visible to verified brands
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: 'var(--ink)',
                  cursor: 'pointer'
                }}>
                  <input type="checkbox" defaultChecked style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--green)'
                  }} />
                  Show in match recommendations
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: 'var(--ink)',
                  cursor: 'pointer'
                }}>
                  <input type="checkbox" style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--green)'
                  }} />
                  Allow direct messages
                </label>
              </div>
            </div>
            
            {/* Notification Preferences */}
            <div style={{
              padding: 'var(--space-lg)',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--hair)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--ink)',
                margin: '0 0 12px 0'
              }}>
                Notifications
              </h3>
              <p style={{
                fontSize: '15px',
                color: 'var(--muted)',
                margin: '0 0 16px 0',
                lineHeight: '1.5'
              }}>
                Choose how you want to be notified about new opportunities
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: 'var(--ink)',
                  cursor: 'pointer'
                }}>
                  <input type="checkbox" defaultChecked style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--green)'
                  }} />
                  New brand matches
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: 'var(--ink)',
                  cursor: 'pointer'
                }}>
                  <input type="checkbox" defaultChecked style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--green)'
                  }} />
                  Partnership proposals
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: 'var(--ink)',
                  cursor: 'pointer'
                }}>
                  <input type="checkbox" style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--green)'
                  }} />
                  Weekly analytics digest
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}