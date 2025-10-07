// src/lib/profileSync.js
import { supabase } from './supabaseClient';

export async function ensureProfileName(session) {
  try {
    if (!session?.user) return;
    const userId = session.user.id;
    const metaName = session.user.user_metadata?.full_name;
    if (!metaName) return;

    // Read current profile
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (error) return; // silently ignore; RLS or network issues

    // Only update if blank/null
    if (!data?.full_name) {
      await supabase
        .from('profiles')
        .update({ full_name: metaName })
        .eq('id', userId);
    }
  } catch {
    // no-op
  }
}
