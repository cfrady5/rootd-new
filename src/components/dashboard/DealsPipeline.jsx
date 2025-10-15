import React, { useState } from 'react';
import { useDeals } from '../../hooks/useDeals';

const STAGES = ['saved','proposed','in_review','completed'];

export default function DealsPipeline() {
  const { deals, updateDealStage, loading } = useDeals();
  const [dragging, setDragging] = useState(null);

  function onDragStart(e, id) { setDragging(id); e.dataTransfer?.setData('text/plain', id); }
  function onDrop(e, stage) {
    e.preventDefault();
    const id = e.dataTransfer?.getData('text/plain') || dragging;
    if (!id) return;
    updateDealStage(id, stage);
    setDragging(null);
  }

  return (
    <div className="card" aria-label="Deals pipeline">
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {STAGES.map(stage => (
          <div key={stage} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,stage)} style={{minHeight:120,padding:8,background:'#fff',borderRadius:8,border:'1px solid var(--border)'}}>
            <div style={{fontWeight:800,textTransform:'capitalize'}}>{stage.replace('_',' ')}</div>
            <div style={{marginTop:8}}>
              {loading && <div>Loading…</div>}
              {deals?.filter(d=>d.stage===stage).map(d => (
                <div key={d.id} draggable onDragStart={e=>onDragStart(e,d.id)} style={{padding:8,marginTop:8,borderRadius:8,boxShadow:'0 4px 12px rgba(0,0,0,0.03)',background:'#fff'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{fontWeight:700}}>{d.business_name}</div>
                    <div style={{fontSize:12,color:'var(--muted)'}}>{d.value || '—'}</div>
                  </div>
                  <div style={{marginTop:6,fontSize:13,color:'var(--muted)'}}>Last activity {d.last_activity || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
