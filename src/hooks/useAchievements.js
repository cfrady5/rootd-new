import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

export function useAchievements(){
  const [achievements,setAchievements]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ let m=true; (async ()=>{ try{ const { data } = await supabase.from('achievements').select('*').order('date', { ascending:false }); if(m) setAchievements(data||[]); }catch(e){console.error(e);} if(m) setLoading(false); })(); return ()=>m=false; },[]);
  async function addAchievement(row){
    const optimistic = [{ id: 'tmp-'+Date.now(), ...row }, ...achievements];
    setAchievements(optimistic);
    try{ const { data, error } = await supabase.from('achievements').insert(row).select().single(); if(error) throw error; setAchievements(prev => [data, ...prev.filter(a=>!a.id.startsWith('tmp-'))]); }catch(e){ console.error(e); setAchievements(prev => prev.filter(a => !a.id.startsWith('tmp-'))); throw e; }
  }
  return { achievements, loading, addAchievement };
}

export default useAchievements;
