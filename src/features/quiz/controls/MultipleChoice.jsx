import React from 'react';

export default function MultipleChoice({ value=[], onChange, error, helperText, question }){
  const set = new Set(value || []);
  const toggle = (opt) => {
    const next = new Set(set);
    if (next.has(opt)) next.delete(opt); else next.add(opt);
    onChange(Array.from(next));
  };
  return (
    <fieldset>
      <legend className="sr-only">{question.title}</legend>
      <div style={{display:'grid',gap:12}}>
        {question.options?.map(opt => (
          <label key={opt} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
            <input type="checkbox" checked={set.has(opt)} onChange={()=>toggle(opt)} />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {helperText && !error && <div style={{color:'var(--color-muted)',marginTop:8}}>{helperText}</div>}
      {error && <div style={{color:'var(--color-danger)',marginTop:8}}>{error}</div>}
    </fieldset>
  );
}