import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

export function usePersona(){
  const [persona,setPersona]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ let m=true; (async ()=>{ try{ const { data } = await supabase.from('personas').select('*').maybeSingle(); if(m) setPersona(data||{}); }catch(e){console.error(e);} if(m) setLoading(false); })(); return ()=>m=false; },[]);
  return { persona, loading };
}

export default usePersona;
