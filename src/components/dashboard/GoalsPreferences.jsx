import React, { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';

export default function GoalsPreferences() {
  const { profile, saveProfile, loading } = useProfile();
  const [local, setLocal] = useState({});

  React.useEffect(()=>{ if (profile) setLocal(profile); }, [profile]);

  function validate() {
    // simple inline validation
    if (!local.availability) return 'Add availability';
    if (!local.preferred_radius) return 'Set a radius';
    return null;
  }

  async function onSave() {
    const err = validate();
    if (err) return alert(err);
    try {
      console.log('event: goals_save');
      await saveProfile({ preferred_radius: local.preferred_radius, availability: local.availability, compensation: local.compensation });
    } catch (e) { console.error(e); }
  }

  return (
    <div className="card" aria-label="Goals and preferences">
      {loading ? <div>Loading…</div> : (
        <div style={{display:'grid',gap:8}}>
          <label style={{fontWeight:700}}>Preferred radius (miles)</label>
          <input className="input" type="number" value={local.preferred_radius || ''} onChange={e=>setLocal({...local, preferred_radius: e.target.value})} />

          <label style={{fontWeight:700}}>Availability</label>
          <input className="input" value={local.availability || ''} onChange={e=>setLocal({...local, availability: e.target.value})} placeholder="Weekdays 9-5" />

          <label style={{fontWeight:700}}>Compensation preferences</label>
          <select className="input" value={local.compensation || ''} onChange={e=>setLocal({...local, compensation: e.target.value})}>
            <option value="">Choose</option>
            <option value="paid">Paid ($)</option>
            <option value="barter">Barter</option>
            <option value="both">Either</option>
          </select>

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="btn" onClick={() => { setLocal(profile || {}); }}>Reset</button>
            <button className="btn btn-primary" onClick={onSave}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

