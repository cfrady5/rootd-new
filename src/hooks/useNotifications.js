import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

export function useNotifications(){
  const [notifications,setNotifications]=useState([]);
  useEffect(()=>{ let m=true; (async ()=>{ try{ const { data } = await supabase.from('notifications').select('*'); if(m) setNotifications(data||[]); }catch(e){console.error(e);} })(); return ()=>m=false; },[]);
  async function markRead(id){ setNotifications(prev=> prev.map(n=> n.id===id ? {...n, read:true} : n)); try{ await supabase.from('notifications').update({ read:true }).eq('id', id); }catch(e){ console.error(e); } }
  return { notifications, markRead };
}

export default useNotifications;
