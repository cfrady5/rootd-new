import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import {
  LayoutDashboard,
  Handshake,
  Users,
  Building2,
  ShieldCheck,
  DollarSign,
  CheckSquare,
  Settings,
  Bell,
  Menu,
  LogOut
} from 'lucide-react';

const navItems = [
  { path: '/director/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/director/deals', label: 'Deals', icon: Handshake },
  { path: '/director/athletes', label: 'Athletes', icon: Users },
  { path: '/director/brands', label: 'Brands', icon: Building2 },
  { path: '/director/compliance', label: 'Compliance', icon: ShieldCheck },
  { path: '/director/finance', label: 'Finance', icon: DollarSign },
  { path: '/director/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/director/settings', label: 'Settings', icon: Settings }
];

export default function DirectorLayout() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '60px' }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: '60px',
          bottom: 0,
          left: 0,
          width: '256px',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          zIndex: 50,
          transform: sidebarOpen || window.innerWidth >= 1024 ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        {/* Logo/Header */}
        <div style={{ 
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h1 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#111827', 
            margin: 0 
          }}>
            Rootd Organization
          </h1>
          <p style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            margin: '4px 0 0 0' 
          }}>
            Director Portal
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ 
          flex: 1, 
          padding: '16px 12px'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  backgroundColor: isActive ? '#ecfdf5' : 'transparent',
                  color: isActive ? '#059669' : '#374151'
                }}
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Icon style={{ width: '20px', height: '20px' }} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ 
          padding: '12px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '8px 12px',
            marginBottom: '8px'
          }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              backgroundColor: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#059669'
              }}>
                {session?.user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#111827',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {session?.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <LogOut style={{ width: '20px', height: '20px' }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ 
        flex: 1,
        marginLeft: window.innerWidth >= 1024 ? '256px' : '0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top bar */}
        <header style={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 24px',
          position: 'sticky',
          top: '60px',
          zIndex: 10
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Menu style={{ width: '24px', height: '24px', color: '#374151' }} />
            </button>

            <div style={{ flex: 1 }} />

            {/* Notifications placeholder */}
            <button
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Bell style={{ width: '24px', height: '24px', color: '#374151' }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
