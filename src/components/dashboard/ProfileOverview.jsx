import React, { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import supabase from '../../lib/supabaseClient';

export default function ProfileOverview() {
  const { profile, loading, saveProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({});

  useEffect(() => { setLocal(profile || {}); }, [profile]);

  async function uploadAvatar(file) {
    if (!file) return;
    const key = `avatars/${Date.now()}_${file.name}`;
    try {
  const { error } = await supabase.storage.from('avatars').upload(key, file);
  if (error) throw error;
      const url = supabase.storage.from('avatars').getPublicUrl(key).publicURL;
      setLocal(prev => ({ ...prev, avatar_url: url }));
    } catch (err) {
      console.error('uploadAvatar error', err);
    }
  }

  async function onSave() {
    try {
      console.log('event: profile_save');
      await saveProfile(local);
      setEditing(false);
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        border: '1px solid var(--hair)',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--hair)',
          borderTop: '3px solid var(--green)',
          borderRadius: '50%',
          margin: '0 auto 16px',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ color: 'var(--muted)', fontSize: '15px' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-xl)',
      border: '1px solid var(--hair)',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle top accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, var(--green), var(--green-light))',
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-lg)',
        textAlign: 'center'
      }}>
        {/* Profile Image */}
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--green), var(--green-light))',
          boxShadow: 'var(--shadow-lg)',
          border: '4px solid white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: '700',
          color: 'white',
          position: 'relative'
        }}>
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Profile" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            (profile?.full_name || 'A')[0].toUpperCase()
          )}
          
          {/* Edit overlay on hover */}
          {editing && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              📸
            </div>
          )}
        </div>

        {/* Name and Details */}
        <div>
          <h3 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--ink)',
            margin: '0 0 8px 0',
            lineHeight: '1.2'
          }}>
            {profile?.full_name || 'Your Name'}
          </h3>
          
          <div style={{
            fontSize: '15px',
            color: 'var(--muted)',
            marginBottom: 'var(--space-md)',
            fontWeight: '500'
          }}>
            {profile?.school || 'School'} • {profile?.sport || 'Sport'}
          </div>

          {/* Status Badges */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'var(--green)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              Score: {Math.round(profile?.rootd_score || 0)}
            </div>
            
            {profile?.completion_percent >= 90 && (
              <div style={{
                background: 'var(--success)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>✓</span>
                Verified
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => setEditing(true)}
          style={{
            background: editing ? 'var(--muted)' : 'transparent',
            border: `2px solid ${editing ? 'var(--muted)' : 'var(--green)'}`,
            color: editing ? 'white' : 'var(--green)',
            padding: '12px 32px',
            borderRadius: 'var(--radius-md)',
            fontSize: '15px',
            fontWeight: '600',
            cursor: editing ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%'
          }}
          disabled={editing}
          onMouseEnter={e => {
            if (!editing) {
              e.target.style.background = 'var(--green)';
              e.target.style.color = 'white';
            }
          }}
          onMouseLeave={e => {
            if (!editing) {
              e.target.style.background = 'transparent';
              e.target.style.color = 'var(--green)';
            }
          }}
        >
          {editing ? 'Editing...' : 'Edit Profile'}
        </button>

        {/* Edit Form */}
        {editing && (
          <div style={{
            width: '100%',
            padding: 'var(--space-lg)',
            background: 'var(--pill)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--hair)'
          }}>
            <div style={{
              display: 'grid',
              gap: 'var(--space-md)'
            }}>
              <input 
                value={local.full_name || ''} 
                onChange={e => setLocal({ ...local, full_name: e.target.value })} 
                placeholder="Full name"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid var(--hair)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--hair)'}
              />
              
              <input 
                value={local.school || ''} 
                onChange={e => setLocal({ ...local, school: e.target.value })} 
                placeholder="School"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid var(--hair)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--hair)'}
              />
              
              <input 
                value={local.sport || ''} 
                onChange={e => setLocal({ ...local, sport: e.target.value })} 
                placeholder="Sport"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid var(--hair)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--hair)'}
              />

              <input 
                type="file" 
                accept="image/*" 
                onChange={e => uploadAvatar(e.target.files[0])}
                style={{
                  padding: '12px',
                  fontSize: '14px',
                  border: '2px dashed var(--hair)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'white',
                  cursor: 'pointer'
                }}
              />

              <div style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                marginTop: 'var(--space-sm)'
              }}>
                <button 
                  onClick={() => setEditing(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'white',
                    border: '2px solid var(--hair)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'var(--muted)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={onSave}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--green)',
                    border: '2px solid var(--green)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

