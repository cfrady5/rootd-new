import React from 'react';
import { useProfile } from '../../hooks/useProfile';

export default function TopBar({ onFindMatches, onRefresh }) {
  const { profile, loading } = useProfile();

  return (
    <div className="card" role="banner" aria-label="Top bar" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div>
          <div style={{fontSize:'0.95rem', color:'var(--muted)'}}>Welcome back,</div>
          <div style={{fontWeight:800,fontSize:'1.05rem'}}>{loading ? 'Loading…' : (profile?.full_name || 'Athlete')}</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-primary" onClick={() => { console.log('event: find_matches'); onFindMatches?.(); }} aria-label="Find matches">Find Matches</button>
          <button className="btn" onClick={() => { console.log('event: refresh'); onRefresh?.(); }} aria-label="Refresh">Refresh</button>
          <button className="btn" onClick={() => { console.log('event: retake_quiz'); window.location.href = '/quiz'; }} aria-label="Retake quiz">Retake Quiz</button>
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{background:'linear-gradient(90deg,var(--accent-200),var(--accent-300))',padding:'6px 10px',borderRadius:999,fontWeight:700}}>Score {profile?.rootd_score ?? '—'}</div>
        <div style={{width:160}} aria-hidden>
          <div style={{fontSize:12,color:'var(--muted)'}}>Profile</div>
          <div style={{height:10,background:'#eef2f3',borderRadius:6,overflow:'hidden'}}>
            <div style={{width:`${Math.min(100, profile?.completion_percent || 0)}%`,height:'100%',background:'var(--accent-500)'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
