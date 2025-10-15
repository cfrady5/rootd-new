import React from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useAchievements } from '../../hooks/useAchievements';

export default function HeaderBar() {
  const { profile } = useProfile();
  const { achievements } = useAchievements();

  const matchesProposed = 2; // placeholder
  const goalsDone = (achievements || []).length;

  return (
    <header className="card" aria-label="Dashboard header" style={{display:'flex',flexDirection:'column',gap:12,backdropFilter:'blur(6px)',background:'rgba(255,255,255,0.72)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{color:'var(--muted)',fontSize:14}}>Welcome back,</div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{fontWeight:900,fontSize:20}}>{profile?.full_name || 'Athlete'}</div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{padding:'6px 10px',borderRadius:999,background:'linear-gradient(90deg,var(--accent-200),var(--accent-300))',fontWeight:800}}>Rootd {Math.round(profile?.rootd_score||0)}</div>
              <div style={{color:'var(--muted)'}}>AI-calculated match potential</div>
            </div>
          </div>
          <div style={{color:'var(--muted)',marginTop:6}}>Here’s your NIL activity summary this week.</div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src={profile?.avatar_url || '/assets/rootd-logo.png'} alt="avatar" style={{width:56,height:56,borderRadius:999,objectFit:'cover',boxShadow:'0 6px 18px rgba(2,6,23,0.08)'}} />
        </div>
      </div>

      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--muted)'}}>
            <div>Matches proposed</div>
            <div>Goals achieved</div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:6}}>
            <div style={{flex:1,height:12,background:'#f1f5f4',borderRadius:999,overflow:'hidden'}}>
              <div style={{width:`${Math.min(100,(matchesProposed/10)*100)}%`,height:'100%',background:'var(--accent-500)'}}></div>
            </div>
            <div style={{width:120,height:12,background:'#f1f5f4',borderRadius:999,overflow:'hidden'}}>
              <div style={{width:`${Math.min(100,(goalsDone/10)*100)}%`,height:'100%',background:'var(--accent-600)'}}></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
