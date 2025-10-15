import React, { useState } from 'react';
import { useAchievements } from '../../hooks/useAchievements';

export default function Achievements() {
  const { achievements, loading, addAchievement } = useAchievements();
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState({ title:'', type:'', date:'', link:'' });

  async function onAdd() {
    try {
      await addAchievement(local);
      setOpen(false);
      setLocal({ title:'', type:'', date:'', link:'' });
    } catch (e) { console.error(e); }
  }

  return (
    <div className="card" aria-label="Achievements">
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <div style={{fontWeight:800}}>Achievements</div>
        <button className="btn" onClick={() => setOpen(true)}>Add Achievement</button>
      </div>

      {loading && <div>Loading…</div>}
      {!loading && achievements?.length === 0 && <div style={{marginTop:8,color:'var(--muted)'}}>No achievements yet</div>}

      <div style={{marginTop:12}}>
        {achievements?.map(a => (
          <div key={a.id} style={{padding:'8px 0',borderLeft:'2px solid #f0f0f0',marginBottom:8}}>
            <div style={{fontWeight:700}}>{a.title}</div>
            <div style={{color:'var(--muted)'}}>{a.type} • {a.date}</div>
          </div>
        ))}
      </div>

      {open && (
        <div role="dialog" aria-modal style={{marginTop:12}}>
          <input className="input" placeholder="Title" value={local.title} onChange={e=>setLocal({...local,title:e.target.value})} />
          <input className="input" placeholder="Type" value={local.type} onChange={e=>setLocal({...local,type:e.target.value})} />
          <input className="input" placeholder="Date" value={local.date} onChange={e=>setLocal({...local,date:e.target.value})} />
          <input className="input" placeholder="Link" value={local.link} onChange={e=>setLocal({...local,link:e.target.value})} />
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}>
            <button className="btn" onClick={()=>setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={onAdd}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}
