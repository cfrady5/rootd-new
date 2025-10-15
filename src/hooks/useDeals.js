import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

export function useDeals(){
  const [deals,setDeals]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ let m=true; (async ()=>{ try{ const { data } = await supabase.from('deals').select('*'); if(m) setDeals(data||[]); }catch(e){console.error(e);} if(m) setLoading(false); })(); return ()=>m=false; },[]);
  async function updateDealStage(id, stage){
    const optimistic = deals.map(d=> d.id===id ? {...d, stage } : d);
    setDeals(optimistic);
    try{ const { error } = await supabase.from('deals').update({ stage }).eq('id', id); if(error) throw error; }catch(e){ console.error(e); setDeals(deals); }
  }
  return { deals, loading, updateDealStage };
}

export default useDeals;
