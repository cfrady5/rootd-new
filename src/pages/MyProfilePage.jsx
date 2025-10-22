import React from 'react';
import { motion } from 'framer-motion';
import ProfileOverview from '../components/dashboard/ProfileOverview.jsx';
import SocialAnalytics from '../components/dashboard/SocialAnalytics.jsx';
import { useAuth } from '../auth/AuthProvider.jsx';
import { PageHeader, Button } from '../components/PremiumComponents';
import { LogOut } from 'lucide-react';

export default function MyProfilePage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
        // The auth provider will handle redirecting to login
      } catch (error) {
        console.error('Error signing out:', error);
        alert('Failed to sign out. Please try again.');
      }
    }
  };
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
          title="My Profile"
          subtitle="Manage your athlete profile and social presence"
        />

        {/* Profile Management */}
        <div style={{ marginBottom: "24px" }}>
          <ProfileOverview />
        </div>
        
        {/* Social Media Analytics */}
        <div style={{ marginBottom: "24px" }}>
          <SocialAnalytics />
        </div>
        
        {/* Additional Profile Settings - Enhanced Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}
        >
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
        </motion.div>

        {/* Account Actions - Enhanced Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}
        >
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            🚪 Account Actions
          </h2>
          
          <div style={{
            padding: '20px',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 12px 0'
            }}>
              Sign Out
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#6b7280',
              margin: '0 0 16px 0',
              lineHeight: '1.5'
            }}>
              Sign out of your account. You'll be redirected to the login page.
            </p>
            
            <Button
              onClick={handleSignOut}
              variant="danger"
              icon={LogOut}
            >
              Sign Out
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}