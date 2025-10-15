import React from 'react';

export function FadeUp({ children, delay = 0 }) {
  return (
    <div style={{transform:'translateY(8px)',opacity:0,animation:`fadeUp 520ms ${delay}ms ease forwards`}}>
      {children}
    </div>
  );
}

export default FadeUp;
