import React from 'react';
import { useSocials } from '../../hooks/useSocials';

export default function SocialAnalytics(){
  const { socials, loading, refreshSocial } = useSocials();
  return (
    <div className="card" aria-label="Social analytics">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontWeight:800}}>Social Analytics</div>
        <button className="btn">Connect another platform</button>
      </div>
      <div style={{marginTop:12,display:'grid',gap:8}}>
        {loading && <div>Loading…</div>}
        {socials?.slice(0,3).map(s => (
          <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontWeight:700}}>{s.platform}</div>
              <div style={{color:'var(--muted)'}}>{s.followers ?? 0} followers</div>
            </div>
            <div style={{width:180,height:48,background:'#fafafa',borderRadius:8}}>
              {/* placeholder sparkline */}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn" onClick={()=>refreshSocial(s.platform)}>Refresh</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
