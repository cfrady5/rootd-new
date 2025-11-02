import React from 'react';

export default function TextInput({ value='', onChange, error, helperText, question }){
  return (
    <div>
      <input
        type="text"
        value={value || ''}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={question.placeholder || ''}
        aria-label={question.title}
        style={{width:'100%'}}
      />
      {helperText && !error && <div style={{color:'var(--color-muted)',marginTop:8}}>{helperText}</div>}
      {error && <div style={{color:'var(--color-danger)',marginTop:8}}>{error}</div>}
    </div>
  );
}