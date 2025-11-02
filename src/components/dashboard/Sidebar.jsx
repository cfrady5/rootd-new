import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Target, 
  MessageSquare, 
  Shield, 
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';

const navItems = [
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: User, 
    path: '/dashboard/profile',
    description: 'Manage your profile',
    badge: null
  },
  { 
    id: 'matches', 
    label: 'Matches', 
    icon: Target, 
    path: '/dashboard/matches',
    description: 'Brand partnerships',
    badge: 'new'
  },
  { 
    id: 'messages', 
    label: 'Messages', 
    icon: MessageSquare, 
    path: '/dashboard/messages',
    description: 'Inbox & notifications',
    badge: 3
  },
  { 
    id: 'compliance', 
    label: 'Compliance', 
    icon: Shield, 
    path: '/dashboard/compliance',
    description: 'NIL guidelines',
    badge: null
  }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const currentPath = location.pathname;
  
  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };
  
  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="dashboard-overlay"
        onClick={() => setIsCollapsed(true)}
        style={{ display: window.innerWidth <= 768 && !isCollapsed ? 'block' : 'none' }}
      />
      
      <motion.aside
        initial="expanded"
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1] // Apple's standard easing
        }}
        className={`dashboard-sidebar ${!isCollapsed ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
        style={{
          height: '100vh',
          background: 'var(--apple-surface)',
          borderRight: '1px solid var(--apple-border-light)',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '88px', // Account for navbar height
          overflow: 'hidden',
          backdropFilter: 'var(--apple-blur-md)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)'
        }}
      >
      {/* Header Section */}
      <div style={{
        padding: isCollapsed ? 'var(--apple-space-6) var(--apple-space-4)' : 'var(--apple-space-8)',
        borderBottom: '1px solid var(--apple-border-light)',
        marginBottom: 'var(--apple-space-6)',
        textAlign: isCollapsed ? 'center' : 'left',
        position: 'relative'
      }}>
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="apple-heading-3" style={{
                color: 'var(--apple-text-primary)',
                margin: '0 0 var(--apple-space-2) 0'
              }}>
                Dashboard
              </h1>
              <p className="apple-body-small" style={{
                color: 'var(--apple-text-secondary)',
                margin: 0
              }}>
                Your partnership hub
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: '24px',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Target size={24} color="var(--rootd-green)" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="apple-btn-ghost"
          style={{
            position: 'absolute',
            top: 'var(--apple-space-6)',
            right: '-12px',
            width: '24px',
            height: '24px',
            minWidth: '24px',
            padding: 0,
            background: 'var(--apple-surface)',
            border: '1px solid var(--apple-border-light)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--apple-text-secondary)',
            boxShadow: 'var(--apple-shadow-sm)',
            transition: 'all var(--apple-transition-base) var(--apple-ease-out)',
            zIndex: 10
          }}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
      
      {/* Navigation Items */}
      <nav style={{
        flex: 1,
        padding: isCollapsed ? '0 var(--apple-space-2)' : '0 var(--apple-space-4)',
        overflowY: 'auto'
      }}>
        {navItems.map((item, index) => {
          const isActive = currentPath === item.path || 
                          (item.path === '/dashboard/profile' && currentPath === '/dashboard');
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <button
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : ''}
                aria-label={`${item.label} - ${item.description}`}
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? 'apple-btn-primary' : 'apple-btn-ghost'}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isCollapsed ? 0 : 'var(--apple-space-3)',
                  padding: isCollapsed ? 'var(--apple-space-3)' : 'var(--apple-space-4)',
                  marginBottom: 'var(--apple-space-2)',
                  background: isActive 
                    ? 'linear-gradient(135deg, var(--rootd-green) 0%, var(--apple-green-dark) 100%)' 
                    : 'transparent',
                  color: isActive ? 'white' : 'var(--apple-text-primary)',
                  border: isActive ? 'none' : '1px solid transparent',
                  borderRadius: 'var(--apple-radius-lg)',
                  fontSize: 'var(--apple-text-base)',
                  fontWeight: isActive ? 'var(--apple-font-semibold)' : 'var(--apple-font-medium)',
                  cursor: 'pointer',
                  transition: 'all var(--apple-transition-base) var(--apple-ease-out)',
                  textAlign: 'left',
                  boxShadow: isActive ? 'var(--apple-shadow-md)' : 'none',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  minHeight: '48px',
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.target.style.background = 'var(--apple-gray-100)';
                    e.target.style.borderColor = 'var(--apple-border-light)';
                    e.target.style.transform = 'translateX(2px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.transform = 'translateX(0)';
                  }
                }}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: '20px'
                }}>
                  <Icon size={20} />
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ 
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{
                          fontSize: 'var(--apple-text-base)',
                          fontWeight: isActive ? 'var(--apple-font-semibold)' : 'var(--apple-font-medium)',
                          marginBottom: '2px',
                          lineHeight: 1
                        }}>
                          {item.label}
                        </div>
                        <div style={{
                          fontSize: 'var(--apple-text-sm)',
                          opacity: isActive ? 0.9 : 0.7,
                          fontWeight: 'var(--apple-font-regular)',
                          lineHeight: 1.2,
                          color: isActive ? 'rgba(255, 255, 255, 0.8)' : 'var(--apple-text-secondary)'
                        }}>
                          {item.description}
                        </div>
                      </div>
                      {item.badge && (
                        <div className={`apple-badge ${typeof item.badge === 'number' ? 'apple-badge-error' : 'apple-badge-success'}`}>
                          {item.badge}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </nav>
      
      {/* Footer */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: 'var(--apple-space-6)',
              borderTop: '1px solid var(--apple-border-light)',
              marginTop: 'auto'
            }}
          >
            <div className="apple-card" style={{
              background: 'linear-gradient(135deg, rgba(44, 95, 52, 0.05) 0%, rgba(48, 209, 88, 0.05) 100%)',
              padding: 'var(--apple-space-4)',
              border: '1px solid rgba(44, 95, 52, 0.1)',
              boxShadow: 'none'
            }}>
              <div className="apple-flex apple-items-center apple-gap-2" style={{ marginBottom: 'var(--apple-space-2)' }}>
                <Sparkles size={16} color="var(--rootd-green)" />
                <span className="apple-body-small" style={{
                  fontWeight: 'var(--apple-font-semibold)',
                  color: 'var(--apple-text-primary)'
                }}>
                  Need Help?
                </span>
              </div>
              <p className="apple-caption" style={{
                color: 'var(--apple-text-secondary)',
                margin: 0,
                textTransform: 'none',
                letterSpacing: 'normal'
              }}>
                Get support for partnerships and NIL compliance
              </p>
              <button 
                className="apple-btn apple-btn-ghost" 
                style={{ 
                  marginTop: 'var(--apple-space-3)',
                  padding: 'var(--apple-space-2) var(--apple-space-3)',
                  fontSize: 'var(--apple-text-sm)',
                  height: 'auto',
                  width: '100%'
                }}
              >
                <HelpCircle size={14} />
                Contact Support
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
    </>
  );
}