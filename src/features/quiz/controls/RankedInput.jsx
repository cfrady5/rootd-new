import React from 'react';

export default function RankedInput({ value=[], onChange, error, helperText, question }){
  // Simple up/down ranker for now
  const items = question.options || [];
  const order = value.length ? value : items.slice(0, question.max || items.length);

  const move = (i, dir) => {
    const next = order.slice();
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <ul style={{listStyle:'none',padding:0,margin:0,display:'grid',gap:8}}>
        {order.map((opt, i) => (
          <li key={opt} style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:24,textAlign:'right',opacity:.6}}>{i+1}</span>
            <span style={{flex:1}}>{opt}</span>
            <div style={{display:'flex',gap:4}}>
              <button type="button" onClick={()=>move(i,-1)} aria-label={`Move ${opt} up`}>↑</button>
              <button type="button" onClick={()=>move(i,1)} aria-label={`Move ${opt} down`}>↓</button>
            </div>
          </li>
        ))}
      </ul>
      {helperText && !error && <div style={{color:'var(--color-muted)',marginTop:8}}>{helperText}</div>}
      {error && <div style={{color:'var(--color-danger)',marginTop:8}}>{error}</div>}
    </div>
  );
}