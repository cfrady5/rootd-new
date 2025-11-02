import React from 'react';

export default function SliderInput({ value=0, onChange, error, helperText, question }){
  const min = question.min ?? 0; const max = question.max ?? 100; const step = question.step ?? 1;
  return (
    <div>
      <input type="range" min={min} max={max} step={step} value={Number(value)||0} onChange={(e)=>onChange(Number(e.target.value))} aria-label={question.title} />
      <div style={{display:'flex',justifyContent:'space-between',color:'var(--color-muted)',fontSize:14}}>
        <span>{min}</span><span>{value}</span><span>{max}</span>
      </div>
      {helperText && !error && <div style={{color:'var(--color-muted)',marginTop:8}}>{helperText}</div>}
      {error && <div style={{color:'var(--color-danger)',marginTop:8}}>{error}</div>}
    </div>
  );
}