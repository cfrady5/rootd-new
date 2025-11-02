import React from 'react';
import { motion } from 'framer-motion';
import ProfileOverview from '../components/dashboard/ProfileOverview.jsx';
import SocialAnalytics from '../components/dashboard/SocialAnalytics.jsx';
import { useAuth } from '../auth/AuthProvider.jsx';
import { 
  AppleDashboardSection, 
  AppleMetricCard,
  AppleProgressBar 
} from '../components/AppleDashboardComponents.jsx';
import { 
  LogOut, 
  User, 
  Instagram, 
  Twitter, 
  Settings,
  Shield,
  Star,
  Trophy
} from 'lucide-react';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Page Header */}
      <div className="apple-flex apple-items-center apple-justify-between" style={{ 
        marginBottom: "var(--apple-space-8)" 
      }}>
        <div>
          <h1 className="apple-heading-1" style={{ 
            margin: "0 0 var(--apple-space-2) 0"
          }}>
            Profile
          </h1>
          <p className="apple-body-large" style={{ 
            color: "var(--apple-text-secondary)",
            margin: 0 
          }}>
            Manage your athlete profile and social presence
          </p>
        </div>
        
        <button 
          onClick={handleSignOut}
          className="apple-btn apple-btn-ghost apple-flex apple-items-center apple-gap-2"
          style={{ color: "var(--apple-red)" }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* Profile Stats */}
      <AppleDashboardSection 
        title="Profile Overview" 
        description="Your current profile status and metrics"
      >
        <div className="apple-grid apple-grid-cols-4" style={{ marginBottom: "var(--apple-space-8)" }}>
          <AppleMetricCard
            title="Profile Score"
            value="92%"
            change="+8%"
            trend="up"
            icon={Star}
            color="success"
          />
          <AppleMetricCard
            title="Social Reach"
            value="12.5K"
            change="+2.1K"
            trend="up"
            icon={Instagram}
            color="info"
          />
          <AppleMetricCard
            title="Brand Matches"
            value="8"
            change="+3"
            trend="up"
            icon={Trophy}
            color="warning"
          />
          <AppleMetricCard
            title="Compliance"
            value="100%"
            change="0%"
            trend="up"
            icon={Shield}
            color="success"
          />
        </div>
      </AppleDashboardSection>

      {/* Profile Completion */}
      <AppleDashboardSection 
        title="Profile Completion"
        description="Complete your profile to unlock better brand matches"
      >
        <div className="apple-card" style={{ marginBottom: "var(--apple-space-8)" }}>
          <div style={{ marginBottom: "var(--apple-space-6)" }}>
            <AppleProgressBar
              value={75}
              max={100}
              color="success"
              size="lg"
              label="Profile Completion"
              showValue={true}
            />
          </div>
          
          <div className="apple-grid apple-grid-cols-2 apple-gap-4">
            <div className="apple-flex apple-items-center apple-gap-3">
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--apple-green-primary)"
              }} />
              <span className="apple-body-small" style={{ color: "var(--apple-text-secondary)" }}>
                Basic info completed
              </span>
            </div>
            <div className="apple-flex apple-items-center apple-gap-3">
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--apple-green-primary)"
              }} />
              <span className="apple-body-small" style={{ color: "var(--apple-text-secondary)" }}>
                Social accounts linked
              </span>
            </div>
            <div className="apple-flex apple-items-center apple-gap-3">
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--apple-gray-300)"
              }} />
              <span className="apple-body-small" style={{ color: "var(--apple-text-tertiary)" }}>
                Portfolio media needed
              </span>
            </div>
            <div className="apple-flex apple-items-center apple-gap-3">
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--apple-gray-300)"
              }} />
              <span className="apple-body-small" style={{ color: "var(--apple-text-tertiary)" }}>
                Brand preferences needed
              </span>
            </div>
          </div>
        </div>
      </AppleDashboardSection>

      {/* Profile Management - using existing component but styled */}
      <AppleDashboardSection 
        title="Profile Details" 
        description="Edit your personal information and preferences"
        action={{ label: "Edit Profile", onClick: () => {} }}
      >
        <div className="apple-card" style={{ marginBottom: "var(--apple-space-8)" }}>
          <ProfileOverview />
        </div>
      </AppleDashboardSection>
        
      {/* Social Media Analytics - using existing component */}
      <AppleDashboardSection 
        title="Social Analytics" 
        description="Track your social media performance and engagement"
      >
        <div className="apple-card">
          <SocialAnalytics />
        </div>
      </AppleDashboardSection>
        
      {/* Additional Profile Settings */}
      <AppleDashboardSection 
        title="Settings" 
        description="Manage your profile preferences and account settings"
      >

        <div className="apple-grid apple-grid-cols-2">
          {/* Visibility Settings */}
          <div className="apple-card">
            <h3 className="apple-heading-4" style={{ marginBottom: "var(--apple-space-3)" }}>
              Profile Visibility
            </h3>
            <p className="apple-body-small" style={{ 
              color: "var(--apple-text-secondary)",
              marginBottom: "var(--apple-space-4)"
            }}>
              Control who can see your profile and contact you for partnerships
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--apple-space-3)' }}>
              <label className="apple-flex apple-items-center apple-gap-3" style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  defaultChecked 
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--rootd-green)'
                  }} 
                />
                <span className="apple-body">Visible to verified brands</span>
              </label>
            </div>
          </div>
          
          {/* Notification Preferences */}
          <div className="apple-card">
            <h3 className="apple-heading-4" style={{ marginBottom: "var(--apple-space-3)" }}>
              Notifications
            </h3>
            <p className="apple-body-small" style={{ 
              color: "var(--apple-text-secondary)",
              marginBottom: "var(--apple-space-4)"
            }}>
              Choose how you want to be notified about new opportunities
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--apple-space-3)' }}>
              <label className="apple-flex apple-items-center apple-gap-3" style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  defaultChecked 
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--rootd-green)'
                  }} 
                />
                <span className="apple-body">New brand matches</span>
              </label>
            </div>
          </div>
        </div>
      </AppleDashboardSection>
    </motion.div>
  );
}