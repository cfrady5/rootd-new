import React, { useRef, useEffect } from 'react';
import { useMatches } from '../../hooks/useMatches';

export default function BusinessMatches(){
  const { matches, loading, loadMore } = useMatches();
  const loader = useRef();

  useEffect(()=>{
    if(!loader.current) return;
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) loadMore(); });
    obs.observe(loader.current);
    return ()=>obs.disconnect();
  },[loader.current]);

  return (
    <section>
      <div style={{position:'sticky',top:12,zIndex:4,background:'transparent',marginBottom:12}}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <select className="input"><option>All categories</option></select>
          <input className="input" type="range" min={0} max={50} />
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
        {matches?.map(m => (
          <div key={m.id} className="card" style={{position:'relative'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:800}}>{m.name}</div>
                <div style={{color:'var(--muted)'}}>{m.category} • {m.distance_meters ? Math.round(m.distance_meters/1609) : '—'} mi</div>
              </div>
              <div style={{fontWeight:800}}>{Math.round(m.match_score||0)}%</div>
            </div>
            <div style={{marginTop:8,display:'flex',gap:8}}>
              <button className="btn">Propose</button>
              <button className="btn">Save</button>
              <button className="btn">Generate Pitch</button>
            </div>
          </div>
        ))}
      </div>

      <div ref={loader} style={{height:56,display:'grid',placeItems:'center'}}>
        {loading && <div style={{width:220,height:12,background:'#eee',borderRadius:6}} />}
      </div>
    </section>
  );
}
