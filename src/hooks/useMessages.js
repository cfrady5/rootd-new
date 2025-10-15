import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

export function useMessages(){
  const [threads,setThreads]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ let m=true; (async ()=>{ try{ const { data } = await supabase.from('messages').select('*'); if(m) setThreads(data||[]); }catch(e){console.error(e);} if(m) setLoading(false); })(); return ()=>m=false; },[]);
  async function sendMessage(threadId, body){
    console.log('event: send_message', threadId);
    try{ const { data, error } = await supabase.from('messages').insert({ thread_id: threadId, body }); if(error) throw error; setThreads(prev=>[...prev, data]); }catch(e){ console.error(e); }
  }
  return { threads, loading, sendMessage };
}

export default useMessages;
