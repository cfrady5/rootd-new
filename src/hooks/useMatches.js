import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

export function useMatches(){
  const [matches,setMatches]=useState([]);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(0);

  useEffect(()=>{ let m=true; (async ()=>{ try{ const { data } = await supabase.from('business_matches').select('*').order('score', { ascending:false }).range(0,19); if(m) setMatches(data||[]); }catch(e){console.error(e);} if(m) setLoading(false); })(); return ()=>m=false; },[]);

  async function loadMore(){
    setLoading(true);
    try{
      const from = (page+1)*20;
      const to = from+19;
      const { data } = await supabase.from('business_matches').select('*').order('score',{ascending:false}).range(from,to);
      if (data && data.length) setMatches(prev=>[...prev,...data]);
      setPage(p=>p+1);
    }catch(e){ console.error(e); }
    setLoading(false);
  }

  return { matches, loading, loadMore };
}

export default useMatches;
