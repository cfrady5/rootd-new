import React from 'react';
import { useTasks } from '../../hooks/useTasks';

export default function TasksPanel() {
  const { tasks, toggleTask } = useTasks();

  return (
    <div className="card" aria-label="Tasks">
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <div style={{fontWeight:800}}>Tasks</div>
        <a className="btn" href="#export">Export ICS</a>
      </div>
      <div style={{marginTop:8}}>
        {tasks?.map(t => (
          <div key={t.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:8}}>
            <div>
              <div style={{fontWeight:700}}>{t.title}</div>
              <div style={{color:'var(--muted)'}}>{t.due}</div>
            </div>
            <div>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
