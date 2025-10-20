import React from 'react';
import { useMessages } from '../../hooks/useMessages';

export default function MessagesDrawer({ open, onClose }) {
  const { threads, loading } = useMessages();
  return (
    <div role="dialog" aria-hidden={!open} style={{width:360,padding:12,display: open ? 'block' : 'none'}}>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <div style={{fontWeight:800}}>Messages</div>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
      {loading && <div>Loading…</div>}
      <div style={{marginTop:12}}>
        {threads?.map(t=> (
          <div key={t.id} style={{padding:8,borderBottom:'1px solid var(--border)'}}>
            <div style={{fontWeight:700}}>{t.business_name}</div>
            <div style={{color:'var(--muted)'}}>{t.last_message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
