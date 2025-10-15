import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

export function useSocials() {
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ let m=true; (async ()=>{ try{ const { data } = await supabase.from('socials').select('*'); if(m) setSocials(data||[]); }catch(e){console.error(e);} if(m) setLoading(false); })(); return ()=>m=false; },[]);

  async function refreshSocial(platform){
    console.log('event: social_refresh', platform);
    // optimistic UI: mark as loading
    const updated = socials.map(s=> s.platform===platform ? {...s, refreshing:true} : s);
    setSocials(updated);
    try{
      // call supabase function or endpoint to refresh (stub)
      await new Promise(r=>setTimeout(r,800));
      setSocials(socials.map(s=> s.platform===platform ? {...s, followers: (s.followers||0)+Math.round(Math.random()*10), refreshing:false, last_refreshed: new Date().toISOString()} : s));
    }catch(e){ console.error(e); setSocials(socials.map(s=> s.platform===platform ? {...s, refreshing:false} : s)); }
  }

  return { socials, loading, refreshSocial };
}

export default useSocials;
