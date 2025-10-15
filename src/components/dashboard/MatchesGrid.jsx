import React, { useState, useRef, useEffect } from 'react';
import { useMatches } from '../../hooks/useMatches';

export default function MatchesGrid() {
  const { matches, loading, loadMore } = useMatches();
  const [selected, setSelected] = useState(new Set());
  const loader = useRef();

  useEffect(()=>{
    if (!loader.current) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    });
    obs.observe(loader.current);
    return ()=>obs.disconnect();
  },[loader.current]);

  return (
    <div>
      <div style={{marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',gap:8}}>
          <select className="input"><option>All categories</option></select>
          <select className="input"><option>Any distance</option></select>
          <input className="input" placeholder="Min score" />
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn" onClick={()=>{console.log('batch: save',Array.from(selected));}}>Save</button>
          <button className="btn" onClick={()=>{console.log('batch: propose',Array.from(selected));}}>Propose</button>
          <button className="btn" onClick={()=>{console.log('batch: pitch',Array.from(selected));}}>Generate Pitch</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
        {loading && <div>Loading…</div>}
        {matches?.map(m => (
          <div key={m.id} className="card" role="article">
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div>
                <div style={{fontWeight:800}}>{m.business_name}</div>
                <div style={{color:'var(--muted)'}}>{m.category} • {m.distance}mi</div>
              </div>
              <div>
                <input type="checkbox" aria-label={`Select ${m.business_name}`} onChange={e=>{ const s=new Set(selected); e.target.checked ? s.add(m.id) : s.delete(m.id); setSelected(s); }} />
              </div>
            </div>
            <div style={{marginTop:8,display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="btn btn-primary">Save</button>
              <button className="btn">Propose</button>
              <button className="btn">Explain score</button>
            </div>
          </div>
        ))}
      </div>

      <div ref={loader} style={{height:48}} />
    </div>
  );
}
