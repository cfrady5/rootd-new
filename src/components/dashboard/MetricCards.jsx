import React, { useEffect, useState } from 'react';
import { FadeUp } from './Animations.jsx';

function CountUp({ value=0 }){
  const [n,setN]=useState(0);
  useEffect(()=>{ let mounted=true; const dur=700; const start=Date.now(); const from=0; const to=value; function tick(){ if(!mounted) return; const pct=Math.min(1,(Date.now()-start)/dur); setN(Math.round(from + (to-from)*pct)); if(pct<1) requestAnimationFrame(tick); } tick(); return ()=>mounted=false; },[value]);
  return <span style={{fontWeight:900,fontSize:20}}>{n}</span>;
}

export default function MetricCards(){
  const metrics=[{label:'Total Matches',value:124,trend:5},{label:'Active Deals',value:6,trend:-2},{label:'New Businesses',value:18,trend:12},{label:'Avg Match Score',value:82,trend:3}];
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
      {metrics.map((m,i)=> (
        <FadeUp key={m.label} delay={i*80}>
          <div className="card" style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{color:'var(--muted)',fontSize:13}}>{m.label}</div>
              <div style={{color: m.trend>=0 ? 'var(--accent-600)' : '#ef4444',fontWeight:800,fontSize:12}}>{m.trend>=0?`+${m.trend}%`:`${m.trend}%`}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <CountUp value={m.value} />
            </div>
          </div>
        </FadeUp>
      ))}
    </div>
  );
}
