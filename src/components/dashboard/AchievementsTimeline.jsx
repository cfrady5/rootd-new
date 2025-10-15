import React from 'react';
import { useAchievements } from '../../hooks/useAchievements';

export default function AchievementsTimeline(){
  const { achievements, loading } = useAchievements();
  return (
    <div className="card" aria-label="Achievements timeline">
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <div style={{fontWeight:800}}>Achievements</div>
        <button className="btn">+ Add New</button>
      </div>
      <div style={{marginTop:12}}>
        {loading && <div>Loading…</div>}
        <div style={{position:'relative',paddingLeft:16}}>
          <div style={{position:'absolute',left:7,top:0,bottom:0,width:2,background:'#f1f5f4'}} />
          {achievements?.map((a,i)=> (
            <div key={a.id} style={{padding:'8px 0 8px 24px'}}>
              <div style={{fontWeight:700}}>{a.title}</div>
              <div style={{color:'var(--muted)'}}>{a.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
