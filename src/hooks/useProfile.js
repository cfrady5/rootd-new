import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let mounted = true;
    async function load(){
      try {
        const { data } = await supabase.from('athlete_profiles').select('*').maybeSingle();
        if (mounted) setProfile(data);
      } catch(e) { console.error(e); }
      if (mounted) setLoading(false);
    }
    load();
    return ()=>{ mounted=false; };
  },[]);

  async function saveProfile(updates){
    const optimistic = { ...profile, ...updates };
    setProfile(optimistic);
    try {
      const { error } = await supabase.from('athlete_profiles').upsert(optimistic);
      if (error) throw error;
    } catch(e) {
      console.error(e);
      setProfile(profile); // rollback
      throw e;
    }
  }

  return { profile, loading, saveProfile };
}

export default useProfile;
