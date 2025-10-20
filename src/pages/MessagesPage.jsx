import React, { useState } from 'react';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('messages');
  
  const messages = [
    {
      id: 1,
      from: 'Nike Running',
      subject: 'Partnership Proposal - Social Campaign',
      preview: 'We love your running content and would like to discuss a potential partnership...',
      time: '2 hours ago',
      unread: true,
      type: 'proposal'
    },
    {
      id: 2,
      from: 'Gatorade',
      subject: 'Re: Summer Campaign Collaboration',
      preview: 'Thanks for your interest! We\'d like to schedule a call to discuss details...',
      time: '1 day ago',
      unread: false,
      type: 'reply'
    },
    {
      id: 3,
      from: 'Under Armour',
      subject: 'Your application has been approved!',
      preview: 'Congratulations! Your application for our athlete program has been approved...',
      time: '3 days ago',
      unread: false,
      type: 'approval'
    }
  ];
  
  const notifications = [
    {
      id: 1,
      title: 'New Brand Match',
      message: 'You have 3 new brand matches with 90%+ compatibility',
      time: '1 hour ago',
      type: 'match',
      unread: true
    },
    {
      id: 2,
      title: 'Profile View',
      message: 'Adidas viewed your profile',
      time: '4 hours ago',
      type: 'view',
      unread: true
    },
    {
      id: 3,
      title: 'Social Analytics Update',
      message: 'Your Instagram engagement increased by 15% this week',
      time: '2 days ago',
      type: 'analytics',
      unread: false
    },
    {
      id: 4,
      title: 'NIL Compliance Reminder',
      message: 'Remember to disclose your partnership posts',
      time: '1 week ago',
      type: 'compliance',
      unread: false
    }
  ];

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
            Messages & Notifications
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--muted)',
            margin: 0,
            fontWeight: '500'
          }}>
            Stay connected with brands and track important updates
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)',
          border: '1px solid var(--hair)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg)',
            padding: '4px'
          }}>
            <button
              onClick={() => setActiveTab('messages')}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'messages' ? 'white' : 'transparent',
                color: activeTab === 'messages' ? 'var(--ink)' : 'var(--muted)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'messages' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              💬 Messages ({messages.filter(m => m.unread).length})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'notifications' ? 'white' : 'transparent',
                color: activeTab === 'notifications' ? 'var(--ink)' : 'var(--muted)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'notifications' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              🔔 Notifications ({notifications.filter(n => n.unread).length})
            </button>
          </div>
        </div>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--hair)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: 'var(--space-lg)',
              borderBottom: '1px solid var(--hair)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--ink)',
                margin: 0
              }}>
                Inbox
              </h2>
              <button style={{
                background: 'var(--green)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Mark All Read
              </button>
            </div>
            
            <div>
              {messages.map(message => (
                <div
                  key={message.id}
                  style={{
                    padding: 'var(--space-lg)',
                    borderBottom: '1px solid var(--hair)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: message.unread ? 'rgba(44, 95, 52, 0.02)' : 'white'
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = 'var(--bg)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = message.unread ? 'rgba(44, 95, 52, 0.02)' : 'white';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm)'
                    }}>
                      <span style={{
                        fontSize: '20px'
                      }}>
                        {message.type === 'proposal' ? '💼' : 
                         message.type === 'reply' ? '↩️' : '✅'}
                      </span>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: message.unread ? '700' : '600',
                        color: 'var(--ink)',
                        margin: 0
                      }}>
                        {message.from}
                      </h3>
                      {message.unread && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--green)'
                        }} />
                      )}
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: 'var(--muted)',
                      fontWeight: '500'
                    }}>
                      {message.time}
                    </span>
                  </div>
                  <h4 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'var(--ink)',
                    margin: '0 0 6px 0'
                  }}>
                    {message.subject}
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--muted)',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {message.preview}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--hair)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: 'var(--space-lg)',
              borderBottom: '1px solid var(--hair)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--ink)',
                margin: 0
              }}>
                Notifications
              </h2>
              <button style={{
                background: 'var(--green)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Clear All
              </button>
            </div>
            
            <div>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  style={{
                    padding: 'var(--space-lg)',
                    borderBottom: '1px solid var(--hair)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: notification.unread ? 'rgba(44, 95, 52, 0.02)' : 'white'
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = 'var(--bg)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = notification.unread ? 'rgba(44, 95, 52, 0.02)' : 'white';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm)'
                    }}>
                      <span style={{
                        fontSize: '20px'
                      }}>
                        {notification.type === 'match' ? '🎯' : 
                         notification.type === 'view' ? '👁️' : 
                         notification.type === 'analytics' ? '📊' : '📋'}
                      </span>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: notification.unread ? '700' : '600',
                        color: 'var(--ink)',
                        margin: 0
                      }}>
                        {notification.title}
                      </h3>
                      {notification.unread && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--green)'
                        }} />
                      )}
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: 'var(--muted)',
                      fontWeight: '500'
                    }}>
                      {notification.time}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--muted)',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}