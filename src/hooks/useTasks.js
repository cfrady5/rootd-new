import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

export function useTasks(){
  const [tasks,setTasks]=useState([]);
  useEffect(()=>{ let m=true; (async ()=>{ try{ const { data } = await supabase.from('tasks').select('*'); if(m) setTasks(data||[]); }catch(e){console.error(e);} })(); return ()=>m=false; },[]);
  async function toggleTask(id){ setTasks(prev => prev.map(t => t.id===id ? {...t, done: !t.done} : t)); try{ await supabase.from('tasks').update({ done: true }).eq('id', id); }catch(e){ console.error(e); } }
  return { tasks, toggleTask };
}

export default useTasks;
