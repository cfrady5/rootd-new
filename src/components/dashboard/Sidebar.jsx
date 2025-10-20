import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { 
    id: 'profile', 
    label: 'My Profile', 
    icon: '👤', 
    path: '/dashboard/profile',
    description: 'Manage your profile and social accounts'
  },
  { 
    id: 'matches', 
    label: 'Matches', 
    icon: '🎯', 
    path: '/dashboard/matches',
    description: 'Discover brand partnerships'
  },
  { 
    id: 'messages', 
    label: 'Messages & Notifications', 
    icon: '💬', 
    path: '/dashboard/messages',
    description: 'Inbox and notification center'
  },
  { 
    id: 'compliance', 
    label: 'NIL Compliance', 
    icon: '📋', 
    path: '/dashboard/compliance',
    description: 'Learn about NIL rules and guidelines'
  }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const currentPath = location.pathname;
  
  return (
    <aside style={{
      width: isCollapsed ? '80px' : '280px',
      height: '100vh',
      background: 'rgba(248, 249, 250, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--hair)',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '80px', // Account for navbar height
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden'
    }}>
      
      {/* Logo/Brand Section */}
      <div style={{
        padding: isCollapsed ? 'var(--space-lg) var(--space-md)' : 'var(--space-xl)',
        borderBottom: '1px solid var(--hair)',
        marginBottom: 'var(--space-lg)',
        textAlign: isCollapsed ? 'center' : 'left'
      }}>
        {!isCollapsed ? (
          <>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--ink)',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em'
            }}>
              Dashboard
            </h1>
            <p style={{
              fontSize: '15px',
              color: 'var(--muted)',
              margin: 0,
              fontWeight: '500'
            }}>
              Your brand partnership hub
            </p>
          </>
        ) : (
          <div style={{
            fontSize: '24px',
            fontWeight: '800'
          }}>
            📊
          </div>
        )}
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: 'absolute',
            top: '100px',
            right: '-12px',
            width: '24px',
            height: '24px',
            background: 'white',
            border: '1px solid var(--hair)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '12px',
            color: 'var(--muted)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.target.style.background = 'var(--green)';
            e.target.style.color = 'white';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'white';
            e.target.style.color = 'var(--muted)';
          }}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      {/* Navigation Items */}
      <nav style={{
        flex: 1,
        padding: isCollapsed ? '0 var(--space-sm)' : '0 var(--space-lg)',
        overflowY: 'auto'
      }}>
        {navItems.map(item => {
          const isActive = currentPath === item.path || 
                          (item.path === '/dashboard/profile' && currentPath === '/dashboard');
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.label : ''}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: isCollapsed ? 0 : 'var(--space-md)',
                padding: isCollapsed ? 'var(--space-md)' : 'var(--space-lg)',
                marginBottom: 'var(--space-sm)',
                background: isActive 
                  ? 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)' 
                  : 'transparent',
                color: isActive ? 'white' : 'var(--ink)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: '16px',
                fontWeight: isActive ? '700' : '600',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'left',
                boxShadow: isActive ? '0 4px 20px rgba(44, 95, 52, 0.3)' : 'none',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                minHeight: '56px'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.target.style.background = 'rgba(44, 95, 52, 0.08)';
                  e.target.style.transform = isCollapsed ? 'scale(1.1)' : 'translateX(4px)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'scale(1) translateX(0)';
                }
              }}
            >
              <span style={{ 
                fontSize: '24px',
                minWidth: '32px',
                textAlign: 'center'
              }}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: isActive ? '700' : '600',
                    marginBottom: '4px'
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    opacity: isActive ? 0.9 : 0.7,
                    fontWeight: '500',
                    lineHeight: '1.3'
                  }}>
                    {item.description}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Footer */}
      {!isCollapsed && (
        <div style={{
          padding: 'var(--space-lg)',
          borderTop: '1px solid var(--hair)',
          marginTop: 'auto'
        }}>
          <div style={{
            background: 'rgba(44, 95, 52, 0.05)',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(44, 95, 52, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>✨</span>
              <span style={{
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--ink)'
              }}>
                Need Help?
              </span>
            </div>
            <p style={{
              fontSize: '13px',
              color: 'var(--muted)',
              margin: 0,
              lineHeight: '1.4'
            }}>
              Contact our support team for assistance with partnerships and compliance.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}