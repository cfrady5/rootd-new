import React from 'react';

const sizes = {
  sm: { padding: '6px 12px', fontSize: 14, radius: 8 },
  md: { padding: '10px 16px', fontSize: 16, radius: 10 },
  lg: { padding: '14px 20px', fontSize: 17, radius: 12 },
};

const variants = {
  primary: {
    background: 'var(--color-brand-500)', color: '#fff', border: '1px solid var(--color-brand-600)'
  },
  secondary: {
    background: '#fff', color: 'var(--color-ink)', border: '1px solid var(--color-border)'
  },
  danger: {
    background: 'var(--color-danger)', color: '#fff', border: '1px solid #b91c1c'
  },
  ghost: {
    background: 'transparent', color: 'var(--color-ink)', border: '1px solid transparent'
  }
};

export default function Button({ as:Comp='button', variant='primary', size='md', style, ...props }){
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  return (
    <Comp
      style={{
        display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,
        padding:s.padding,fontSize:s.fontSize,borderRadius:s.radius,
        ...v,
        boxShadow:'var(--shadow-sm)',
        transition:'all .2s',
        textDecoration:'none',
        cursor:'pointer',
        ...style
      }}
      {...props}
    />
  );
}