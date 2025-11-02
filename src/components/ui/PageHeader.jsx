import React from 'react';

export default function PageHeader({ title, description, actions }){
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'}}>
      <div>
        <h1 style={{margin:'0 0 4px',fontSize:'28px',letterSpacing:'-0.02em'}}>{title}</h1>
        {description && <p style={{margin:0,color:'var(--color-muted)'}}>{description}</p>}
      </div>
      {actions && <div style={{display:'flex',gap:12}}>{actions}</div>}
    </div>
  );
}