import React from 'react';

export default function SingleChoice({ value, onChange, error, helperText, question }){
  return (
    <fieldset>
      <legend className="sr-only">{question.title}</legend>
      <div role="radiogroup" aria-label={question.title} style={{display:'grid',gap:12}}>
        {question.options?.map(opt => (
          <label key={opt} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
            <input type="radio" name={question.id} value={opt} checked={value===opt} onChange={() => onChange(opt)} />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {helperText && !error && <div style={{color:'var(--color-muted)',marginTop:8}}>{helperText}</div>}
      {error && <div style={{color:'var(--color-danger)',marginTop:8}}>{error}</div>}
    </fieldset>
  );
}