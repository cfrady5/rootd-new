import React from 'react';
import { useSocials } from '../../hooks/useSocials';

export default function SocialAccounts() {
  const { socials, loading, refreshSocial } = useSocials();

  return (
    <div className="card" aria-label="Social accounts">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontWeight:800}}>Social Accounts</div>
        <div style={{color:'var(--muted)'}}>Last refreshed: {socials?.[0]?.last_refreshed ?? '—'}</div>
      </div>
      {loading && <div>Loading…</div>}
      {!loading && (!socials || socials.length === 0) && <div style={{marginTop:8,color:varOr('--muted','gray')}}>No accounts connected</div>}
      <div style={{display:'grid',gap:8,marginTop:8}}>
        {socials && socials.map(s => (
          <div key={s.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontWeight:700}}>{s.platform}</div>
              <div style={{color:'var(--muted)'}}>{s.followers ?? '—'} followers</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button className="btn" onClick={() => console.log('event: connect_social', s.platform)}>{s.connected ? 'Disconnect' : 'Connect'}</button>
              <button className="btn btn-primary" onClick={() => refreshSocial(s.platform)}>Refresh</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function varOr(name, fallback) { try { return getComputedStyle(document.documentElement).getPropertyValue(name) || fallback; } catch { return fallback; } }
