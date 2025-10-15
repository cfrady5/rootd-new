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
    <div className="card" aria-label="Profile overview">
      {loading ? (
        <div>Loading…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr auto', gap: 12, alignItems: 'center' }}>
            <img src={profile?.avatar_url || '/assets/rootd-logo.png'} alt="avatar" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{profile?.full_name || 'Your name'}</div>
              <div style={{ color: 'var(--muted)' }}>{profile?.school || 'School'} • {profile?.sport || 'Sport'}</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ background: '#eefbf4', color: 'var(--accent-700)', padding: '4px 8px', borderRadius: 999, fontWeight: 700 }}>Rootd {profile?.rootd_score ?? '—'}</span>
                {profile?.completion_percent >= 90 && (
                  <span style={{ marginLeft: 8, background: 'rgba(16,185,129,0.08)', color: 'var(--accent-700)', padding: '3px 8px', borderRadius: 999, fontWeight: 700 }}>Verified</span>
                )}
              </div>
            </div>
            <div>
              <button className="btn" onClick={() => setEditing(true)}>Edit</button>
            </div>
          </div>

          {editing && (
            <div role="dialog" aria-modal="true" style={{ marginTop: 12 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <input className="input" value={local.full_name || ''} onChange={e => setLocal({ ...local, full_name: e.target.value })} placeholder="Full name" />
                <input className="input" value={local.school || ''} onChange={e => setLocal({ ...local, school: e.target.value })} placeholder="School" />
                <input className="input" value={local.sport || ''} onChange={e => setLocal({ ...local, sport: e.target.value })} placeholder="Sport" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="file" accept="image/*" onChange={e => uploadAvatar(e.target.files[0])} />
                  <div style={{ flex: 1 }} />
                  <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={onSave}>Save</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

