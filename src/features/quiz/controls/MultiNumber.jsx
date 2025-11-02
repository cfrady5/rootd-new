import React from 'react';

export default function MultiNumber({ value={}, onChange, error, helperText, question }){
  const fields = question.fields || [];
  const v = value || {};
  const set = (key, num) => onChange({ ...v, [key]: num });
  return (
    <div style={{display:'grid',gap:12}}>
      {fields.map(f => (
        <label key={f.key} style={{display:'grid',gap:6}}>
          <span style={{fontSize:14,opacity:.8}}>{f.label}</span>
          <input type="number" value={v[f.key] ?? ''} onChange={(e)=>set(f.key, e.target.value === '' ? '' : Number(e.target.value))} />
        </label>
      ))}
      {helperText && !error && <div style={{color:'var(--color-muted)'}}>{helperText}</div>}
      {error && <div style={{color:'var(--color-danger)'}}>{error}</div>}
    </div>
  );
}