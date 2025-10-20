import { useState, useEffect, useRef, useCallback } from 'react';
import supabase from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthProvider';

export function useMatches(){
  const [matches,setMatches]=useState([]);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(0);
  const { session } = useAuth();
  const athleteId = session?.user?.id;
  const channelRef = useRef(null);
  const refreshTimer = useRef(null);

  // Helper to convert distance_meters to distance_miles and deduplicate
  const convertDistance = (matchData) => {
    // First, deduplicate by business_place_id
    const seen = new Set();
    const uniqueMatches = (matchData || []).filter(match => {
      if (seen.has(match.business_place_id)) {
        return false;
      }
      seen.add(match.business_place_id);
      return true;
    });

    return uniqueMatches.map(match => {
      let distance_miles = null;
      
      // Try to convert distance_meters to miles
      if (match.distance_meters !== null && match.distance_meters !== undefined && !isNaN(match.distance_meters)) {
        distance_miles = (parseFloat(match.distance_meters) / 1609.34).toFixed(1);
      }
      
      const converted = {
        ...match,
        distance_miles
      };
      
      // Debug log first match to see data structure
      if (uniqueMatches.indexOf(match) === 0) {
        console.log('Match data sample:', { 
          name: match.name, 
          distance_meters: match.distance_meters,
          distance_meters_type: typeof match.distance_meters,
          distance_miles: converted.distance_miles,
          all_fields: Object.keys(match)
        });
      }
      return converted;
    });
  };

  // Function to refresh matches from database (with cache seeding)
  const refreshMatches = useCallback(async () => {
    if (!athleteId) {
      console.log('refreshMatches: No athleteId, skipping');
      setLoading(false);
      return;
    }
    setLoading(true);
    // Pre-seed from cache so UI updates instantly after function returns
    let cached = null;
    try {
      cached = JSON.parse(localStorage.getItem('rootd_last_matches') || 'null');
      if (Array.isArray(cached) && cached.length) {
        console.log('refreshMatches: seeding from cached function results:', cached.length);
        const converted = convertDistance(cached);
        setMatches(converted);
      }
    } catch(_e) { /* ignore bad cache */ }
    try {
      const { data, error } = await supabase
        .from('business_matches')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('match_score', { ascending:false })
        .range(0,19);
      if (error) {
        console.error('refreshMatches error:', error);
      }
      console.log('Refreshed matches count:', data?.length || 0, 'for athlete:', athleteId);
      const converted = convertDistance(data);
      console.log('After deduplication:', converted.length);
      if (converted.length > 0) {
        setMatches(converted);
        // Clear cache only when DB returns non-empty
        try { localStorage.removeItem('rootd_last_matches'); } catch(_e) {}
      } else if (Array.isArray(cached) && cached.length) {
        // Keep cached view if DB appears empty
        console.log('DB returned 0, keeping cached matches for now');
      } else {
        setMatches([]);
      }
      setPage(0);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  }, [athleteId]);

  useEffect(()=>{ 
    let m=true;
    if (!athleteId) {
      console.log('useMatches: No athleteId yet, waiting...');
      setLoading(false);
      return;
    }
    // Seed from any cached function results to improve perceived latency
    try {
      const cached = JSON.parse(localStorage.getItem('rootd_last_matches') || 'null');
      if (Array.isArray(cached) && cached.length) {
        console.log('Seeding matches from cached function results:', cached.length);
        const converted = convertDistance(cached);
        setMatches(converted);
        // Do not early return; still fetch from DB to reconcile
      }
    } catch(_e) { /* ignore bad cache */ }
    (async ()=>{ 
      try{ 
        const { data, error } = await supabase
          .from('business_matches')
          .select('*')
          .eq('athlete_id', athleteId)
          .order('match_score', { ascending:false })
          .range(0,19); 
        if (error) {
          console.error('initial fetch error:', error);
        }
        console.log('Fetched matches count:', data?.length || 0, 'for athlete:', athleteId);
        if(m) {
          const converted = convertDistance(data);
          console.log('After deduplication:', converted.length);
          setMatches(converted);
          // Clear cache after successful reconciliation
          try { localStorage.removeItem('rootd_last_matches'); } catch(_e) {}
        }
      }catch(e){console.error(e);} 
      if(m) setLoading(false); 
    })(); 
    return ()=>m=false; 
  },[athleteId]);

  // Subscribe to realtime changes for this user's matches
  useEffect(() => {
    if (!athleteId) return;

    // Clean existing channel
    try {
      channelRef.current?.unsubscribe?.();
    } catch (e) {
      console.warn('Failed to unsubscribe previous channel:', e);
    }

    const channel = supabase
      .channel(`bm_${athleteId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'business_matches',
        filter: `athlete_id=eq.${athleteId}`
      }, (payload) => {
        console.log('Realtime business_matches change:', payload.eventType);
        // Debounce refreshes in bursty upserts
        clearTimeout(refreshTimer.current);
        refreshTimer.current = setTimeout(() => {
          refreshMatches();
        }, 150);
      })
      .subscribe((status) => {
        console.log('Realtime channel status:', status);
      });

    channelRef.current = channel;
    return () => {
      try {
        channelRef.current?.unsubscribe?.();
      } catch (e) {
        console.warn('Failed to unsubscribe channel on cleanup:', e);
      }
      clearTimeout(refreshTimer.current);
    };
  }, [athleteId, refreshMatches]);

  async function loadMore(){
    if (!athleteId) {
      console.log('loadMore: No athleteId');
      return;
    }
    setLoading(true);
    try{
      const from = (page+1)*20;
      const to = from+19;
      const { data, error } = await supabase
        .from('business_matches')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('match_score',{ascending:false})
        .range(from,to);
      if (error) {
        console.error('loadMore error:', error);
      }
      if (data && data.length) {
        const converted = convertDistance(data);
        console.log('LoadMore - fetched:', data.length, 'after dedup:', converted.length);
        setMatches(prev => {
          // Also deduplicate against existing matches
          const existingIds = new Set(prev.map(m => m.business_place_id));
          const newUnique = converted.filter(m => !existingIds.has(m.business_place_id));
          console.log('LoadMore - adding:', newUnique.length, 'new unique matches');
          return [...prev, ...newUnique];
        });
        setPage(p=>p+1);
      }
    }catch(e){ console.error(e); }
    setLoading(false);
  }

  return { matches, loading, loadMore, refreshMatches };
}

export default useMatches;
