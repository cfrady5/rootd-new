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
      const { data, error } = await supabase.storage.from('avatars').upload(key, file);
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

  return (
    <div className="profile-card" aria-label="Profile overview">
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--secondary)' }}>Loading…</div>
      ) : (
        <>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '16px' 
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
              border: '3px solid white'
            }}>
              <img 
                src={profile?.avatar_url || '/assets/rootd-logo.png'} 
                alt="Profile" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }} 
              />
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontWeight: '700', 
                fontSize: '20px', 
                color: 'var(--text)', 
                marginBottom: '4px' 
              }}>
                {profile?.full_name || 'Your Name'}
              </div>
              <div style={{ 
                color: 'var(--secondary)', 
                fontSize: '14px',
                marginBottom: '12px' 
              }}>
                {profile?.school || 'School'} • {profile?.sport || 'Sport'}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <span style={{ 
                  background: 'var(--primary)', 
                  color: 'white', 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  fontWeight: '600',
                  fontSize: '12px'
                }}>
                  Rootd {profile?.rootd_score ?? '—'}
                </span>
                {profile?.completion_percent >= 90 && (
                  <span style={{ 
                    background: 'var(--accent-200)', 
                    color: 'var(--primary)', 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => setEditing(true)}
              style={{
                background: 'transparent',
                border: '2px solid var(--primary)',
                color: 'var(--primary)',
                padding: '8px 24px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => {
                e.target.style.background = 'var(--primary)';
                e.target.style.color = 'white';
              }}
              onMouseOut={e => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--primary)';
              }}
            >
              Edit Profile
            </button>
          </div>

          {editing && (
            <div role="dialog" aria-modal="true" style={{ 
              marginTop: '20px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'grid', gap: '12px' }}>
                <input 
                  className="input" 
                  value={local.full_name || ''} 
                  onChange={e => setLocal({ ...local, full_name: e.target.value })} 
                  placeholder="Full name"
                  style={{
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px'
                  }}
                />
                <input 
                  className="input" 
                  value={local.school || ''} 
                  onChange={e => setLocal({ ...local, school: e.target.value })} 
                  placeholder="School"
                  style={{
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px'
                  }}
                />
                <input 
                  className="input" 
                  value={local.sport || ''} 
                  onChange={e => setLocal({ ...local, sport: e.target.value })} 
                  placeholder="Sport"
                  style={{
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px'
                  }}
                />
                
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => uploadAvatar(e.target.files[0])}
                  style={{
                    padding: '8px',
                    fontSize: '14px',
                    border: '2px dashed var(--border)',
                    borderRadius: '8px',
                    background: 'var(--bg)'
                  }}
                />
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
                  <button 
                    onClick={() => setEditing(false)}
                    style={{
                      background: 'transparent',
                      border: '2px solid var(--border)',
                      color: 'var(--secondary)',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={onSave}
                    style={{
                      background: 'var(--primary)',
                      border: '2px solid var(--primary)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

