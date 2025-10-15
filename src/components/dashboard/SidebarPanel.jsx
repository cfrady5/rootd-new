import React, { useState } from 'react';
import MessagesDrawer from './MessagesDrawer';
import NotificationsMenu from './NotificationsMenu';
import TasksPanel from './TasksPanel';

export default function SidebarPanel(){
  const [openTab,setOpenTab] = useState(null);
  return (
    <aside style={{width:340}} aria-hidden={openTab===null}>
      <div style={{display:'flex',gap:8}}>
        <button className="btn" onClick={()=>setOpenTab(openTab==='messages'?null:'messages')}>Messages</button>
        <button className="btn" onClick={()=>setOpenTab(openTab==='notifications'?null:'notifications')}>Notifications</button>
        <button className="btn" onClick={()=>setOpenTab(openTab==='tasks'?null:'tasks')}>Tasks</button>
      </div>
      <div style={{marginTop:12}}>
        {openTab==='messages' && <MessagesDrawer open onClose={()=>setOpenTab(null)} />}
        {openTab==='notifications' && <NotificationsMenu />}
        {openTab==='tasks' && <TasksPanel />}
      </div>
    </aside>
  );
}
