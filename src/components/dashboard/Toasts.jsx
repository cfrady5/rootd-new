import React, { useState } from 'react';
import { ToastContext } from './toastContext.js';

export function ToastProvider({ children }){
  const [toasts,setToasts] = useState([]);
  function push(t){ const id=Date.now(); setToasts(prev=>[...prev,{id,...t}]); setTimeout(()=>setToasts(prev=>prev.filter(x=>x.id!==id)),3500); }
  return (
    <ToastContext.Provider value={{push}}>
      {children}
      <div style={{position:'fixed',right:20,top:20,display:'grid',gap:8}}>
        {toasts.map(t=> <div key={t.id} className="card" style={{padding:'8px 12px',background:'white'}}>{t.title}</div>)}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
