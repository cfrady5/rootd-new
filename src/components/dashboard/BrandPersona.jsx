import React from 'react';
import { usePersona } from '../../hooks/usePersona';

export default function BrandPersona() {
  const { persona, loading } = usePersona();

  return (
    <div className="card" aria-label="Brand and persona">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontWeight:800}}>Brand & Personality</div>
        <div style={{fontSize:13,color:'var(--muted)'}} title="Explain my matches" aria-label="Explain my matches" onClick={() => console.log('event: explain_matches')}>Explain</div>
      </div>
      {loading && <div>Loading…</div>}
      {!loading && (
        <div style={{marginTop:8,display:'flex',gap:8,flexWrap:'wrap'}}>
          {(persona?.traits || ['Friendly','Driven','Engaging']).map(t => (
            <div key={t} style={{background:'#F3F9F6',color:'var(--accent-700)',padding:'6px 10px',borderRadius:999,fontWeight:700}}>{t}</div>
          ))}
        </div>
      )}
    </div>
  );
}
