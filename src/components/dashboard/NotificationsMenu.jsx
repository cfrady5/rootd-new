import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationsMenu() {
  const { notifications, markRead } = useNotifications();

  return (
    <div className="card" aria-label="Notifications" style={{width:320}}>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <div style={{fontWeight:800}}>Notifications</div>
        <button className="btn" onClick={() => notifications.forEach(n=>markRead(n.id))}>Mark all read</button>
      </div>
      <div style={{marginTop:8}}>
        {notifications?.map(n => (
          <div key={n.id} style={{padding:8,borderBottom:'1px solid var(--border)'}}>
            <div style={{fontWeight:700}}>{n.title}</div>
            <div style={{color:'var(--muted)'}}>{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
