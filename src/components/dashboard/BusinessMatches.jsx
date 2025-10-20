import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useMatches } from '../../hooks/useMatches';
import { useAuth } from '../../auth/AuthProvider';
import supabase from '../../lib/supabaseClient';
import ProposeDealModal from './ProposeDealModal.jsx';

export default function BusinessMatches({ onRefreshAvailable }){
  const { matches, loading, loadMore, refreshMatches } = useMatches();
  const { session } = useAuth();
  const loader = useRef();
  const [sortBy, setSortBy] = useState('match'); // 'match', 'distance', 'alphabetical'
  const [isClearing, setIsClearing] = useState(false);
  const [savingIds, setSavingIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [maxMiles, setMaxMiles] = useState(50);
  const [savedOnly, setSavedOnly] = useState(false);
  const [modalMatch, setModalMatch] = useState(null);
  
  // Expose refresh function to parent
  useEffect(() => {
    if (onRefreshAvailable && refreshMatches) {
      onRefreshAvailable(refreshMatches);
    }
  }, [onRefreshAvailable, refreshMatches]);
  
  // Handle saving/unsaving a match
  const handleSave = async (match) => {
    if (!session?.user?.id) {
      alert('Please log in to save matches');
      return;
    }
    
    const matchId = match.business_place_id || match.id;
    if (savingIds.has(matchId)) return; // Prevent double-clicks
    
    setSavingIds(prev => new Set(prev).add(matchId));
    
    try {
      const newSavedState = !match.saved;
      
      const { error } = await supabase
        .from('business_matches')
        .update({ saved: newSavedState })
        .eq('athlete_id', session.user.id)
        .eq('business_place_id', match.business_place_id);
      
      if (error) {
        console.error('Error saving match:', error);
        alert('Failed to save: ' + error.message);
      } else {
        console.log(`Match ${newSavedState ? 'saved' : 'unsaved'}:`, match.name);
        // Refresh matches to show updated saved state
        await refreshMatches();
      }
    } catch (e) {
      console.error('Exception saving match:', e);
      alert('Failed to save: ' + e.message);
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(matchId);
        return newSet;
      });
    }
  };
  
  // Check if any matches have distance data
  const hasDistanceData = useMemo(() => {
    return matches.some(m => m.distance_meters !== null && m.distance_meters !== undefined);
  }, [matches]);

  // Debug: log matches data
  React.useEffect(() => {
    if (matches && matches.length > 0) {
      const withDistance = matches.filter(m => m.distance_meters !== null && m.distance_meters !== undefined).length;
      const withoutDistance = matches.length - withDistance;
      console.log(`BusinessMatches - ${matches.length} total: ${withDistance} with distance, ${withoutDistance} without distance`);
      
      if (matches.length > 0) {
        console.log('First match sample:', {
          name: matches[0].name,
          distance_meters: matches[0].distance_meters,
          distance_miles: matches[0].distance_miles,
          has_distance: matches[0].distance_meters !== null && matches[0].distance_meters !== undefined
        });
      }
    }
  }, [matches]);

  // Sort matches based on selected sort option
  const sortedMatches = useMemo(() => {
    if (!matches || matches.length === 0) return [];
    
    const sorted = [...matches];
    
    switch(sortBy) {
      case 'distance':
        return sorted.sort((a, b) => {
          const distA = a.distance_meters || Number.MAX_SAFE_INTEGER;
          const distB = b.distance_meters || Number.MAX_SAFE_INTEGER;
          return distA - distB;
        });
      case 'alphabetical':
        return sorted.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case 'match':
      default:
        return sorted.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    }
  }, [matches, sortBy]);

  // Available categories derived from matches
  const categories = useMemo(() => {
    const set = new Set();
    (matches || []).forEach(m => { if (m?.category) set.add(m.category); });
    const list = Array.from(set).sort((a,b) => a.localeCompare(b));
    return ['All', ...list];
  }, [matches]);

  // Apply filters and search on top of sorting
  const filteredMatches = useMemo(() => {
    let arr = sortedMatches;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(m => (m.name || '').toLowerCase().includes(q));
    }
    if (savedOnly) {
      arr = arr.filter(m => !!m.saved);
    }
    if (category && category.toLowerCase() !== 'all') {
      arr = arr.filter(m => (m.category || '').toLowerCase() === category.toLowerCase());
    }
    if (typeof maxMiles === 'number' && !Number.isNaN(maxMiles)) {
      arr = arr.filter(m => {
        const miles = m.distance_miles ? parseFloat(m.distance_miles) : (
          m.distance_meters != null && !isNaN(m.distance_meters)
            ? parseFloat(m.distance_meters) / 1609.34
            : null
        );
        // Keep items without distance, but filter those with a value over the threshold
        return miles == null || miles <= maxMiles;
      });
    }
    return arr;
  }, [sortedMatches, search, savedOnly, category, maxMiles]);

  // Clear all matches for current user
  const handleClearMatches = async () => {
    if (!session?.user?.id) {
      alert('No user session found');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete all ${matches.length} matches? This cannot be undone.`
    );
    
    if (!confirmed) return;

    setIsClearing(true);
    try {
      const { error } = await supabase
        .from('business_matches')
        .delete()
        .eq('athlete_id', session.user.id);

      if (error) {
        console.error('Error clearing matches:', error);
        alert('Failed to clear matches: ' + error.message);
      } else {
        console.log('Successfully cleared all matches');
        await refreshMatches();
        alert('All matches cleared successfully!');
      }
    } catch (e) {
      console.error('Exception clearing matches:', e);
      alert('Failed to clear matches: ' + e.message);
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(()=>{
    const node = loader.current;
    if(!node) return;
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) loadMore(); });
    obs.observe(node);
    return ()=>obs.disconnect();
  },[loadMore]);

  return (
    <section style={{ padding: 'var(--space-lg)' }}>
      {/* Header with Filters */}
      <div style={{
        position: 'sticky',
        top: 'var(--space-md)',
        zIndex: 4,
        background: 'rgba(248, 249, 250, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        marginBottom: 'var(--space-xl)',
        border: '1px solid var(--hair)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--ink)',
            margin: 0
          }}>
            Brand Matches
          </h2>
          <div style={{
            fontSize: '14px',
            color: 'var(--muted)',
            fontWeight: '500'
          }}>
            {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
          </div>
        </div>
        
        {/* Distance data warning banner */}
        {!hasDistanceData && sortedMatches.length > 0 && (
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            color: '#78350f',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span>⚠️</span>
            <span>Distance data unavailable for existing matches. Retake the quiz to calculate distances.</span>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          gap: 'var(--space-md)',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            style={{
              padding: '12px 16px',
              border: '1px solid var(--hair)',
              borderRadius: 'var(--radius-md)',
              background: 'white',
              fontSize: '15px',
              fontWeight: '500',
              color: 'var(--ink)',
              outline: 'none',
              minWidth: '220px'
            }}
          />

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '1px solid var(--hair)',
              borderRadius: 'var(--radius-md)',
              background: 'white',
              fontSize: '15px',
              fontWeight: '500',
              color: 'var(--ink)',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease',
              minWidth: '180px'
            }}>
            <option value="match">Sort by Match %</option>
            <option value="distance">Sort by Distance</option>
            <option value="alphabetical">Sort Alphabetically</option>
          </select>

          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '1px solid var(--hair)',
              borderRadius: 'var(--radius-md)',
              background: 'white',
              fontSize: '15px',
              fontWeight: '500',
              color: 'var(--ink)',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease',
              minWidth: '160px'
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c.toLowerCase()}>{c}</option>
            ))}
          </select>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            background: 'white',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--hair)'
          }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '500' }}>Distance:</span>
            <input 
              type="range" 
              min={0} 
              max={50}
              value={maxMiles}
              onChange={(e) => setMaxMiles(parseInt(e.target.value, 10))}
              style={{
                width: '100px',
                height: '4px',
                borderRadius: '2px',
                background: 'var(--hair)',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '500' }}>{maxMiles}mi</span>
          </div>

          {/* Saved only toggle */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'white',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--hair)',
            cursor: 'pointer'
          }}>
            <input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} />
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>Saved only</span>
          </label>

          {/* Clear Matches Button */}
          <button
            onClick={handleClearMatches}
            disabled={isClearing || matches.length === 0}
            style={{
              padding: '12px 20px',
              border: '1px solid #dc2626',
              borderRadius: 'var(--radius-md)',
              background: 'white',
              fontSize: '15px',
              fontWeight: '600',
              color: '#dc2626',
              cursor: matches.length === 0 || isClearing ? 'not-allowed' : 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease',
              opacity: matches.length === 0 || isClearing ? 0.5 : 1,
              marginLeft: 'auto'
            }}
            onMouseEnter={(e) => {
              if (matches.length > 0 && !isClearing) {
                e.target.style.background = '#dc2626';
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#dc2626';
            }}
          >
            {isClearing ? '🗑️ Clearing...' : '🗑️ Clear All Matches'}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {(!loading && filteredMatches.length === 0) && (
        <div style={{
          background: 'white',
          border: '1px solid var(--hair)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xxl)',
          textAlign: 'center',
          color: 'var(--muted)',
          marginBottom: 'var(--space-xl)'
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>No matches yet</div>
          <div style={{ fontSize: 15, marginBottom: 16 }}>Run "Find New Matches" above to generate partnerships based on your quiz.</div>
          <div style={{ fontSize: 13 }}>Tip: Make sure your quiz includes your location so we can calculate distance.</div>
        </div>
      )}

      {/* Matches Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 'var(--space-lg)'
      }}>
        {filteredMatches?.map((m, index) => (
          <div key={`${m.business_place_id || m.id}-${index}`} style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            border: '1px solid var(--hair)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'var(--shadow-sm)';
          }}>
            
            {/* Match Score Badge */}
            <div style={{
              position: 'absolute',
              top: 'var(--space-md)',
              right: 'var(--space-md)',
              background: `linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)`,
              color: 'white',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: '0 2px 8px rgba(44, 95, 52, 0.3)'
            }}>
              {Math.round(((m.match_score||0) * 100))}%
            </div>

            {/* Business Info */}
            <div style={{ marginBottom: 'var(--space-lg)', paddingRight: '60px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--ink)',
                margin: '0 0 8px 0',
                lineHeight: '1.3'
              }}>
                {m.name}
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                color: 'var(--muted)',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                <span style={{ 
                  background: 'var(--bg)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px'
                }}>
                  {m.category}
                </span>
                <span>•</span>
                <span>
                  {m.distance_miles ? `${m.distance_miles} mi` : 
                   (m.distance_meters && !isNaN(m.distance_meters)) ? `${(m.distance_meters / 1609.34).toFixed(1)} mi` : 
                   'Distance N/A'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              flexWrap: 'wrap'
            }}>
              <button style={{
                background: 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: '1',
                minWidth: '80px'
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 12px rgba(44, 95, 52, 0.3)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
              onClick={() => setModalMatch(m)}
              >
                💼 Propose
              </button>
              
              <button 
                onClick={() => handleSave(m)}
                disabled={savingIds.has(m.business_place_id || m.id)}
                style={{
                  background: m.saved ? 'rgba(239, 68, 68, 0.1)' : 'white',
                  color: m.saved ? '#ef4444' : 'var(--muted)',
                  border: `1px solid ${m.saved ? '#ef4444' : 'var(--hair)'}`,
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: savingIds.has(m.business_place_id || m.id) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: savingIds.has(m.business_place_id || m.id) ? 0.6 : 1
                }}
                onMouseEnter={e => {
                  if (!savingIds.has(m.business_place_id || m.id)) {
                    e.target.style.borderColor = m.saved ? '#dc2626' : 'var(--green)';
                    e.target.style.color = m.saved ? '#dc2626' : 'var(--green)';
                    e.target.style.background = m.saved ? 'rgba(239, 68, 68, 0.15)' : 'rgba(44, 95, 52, 0.05)';
                  }
                }}
                onMouseLeave={e => {
                  e.target.style.borderColor = m.saved ? '#ef4444' : 'var(--hair)';
                  e.target.style.color = m.saved ? '#ef4444' : 'var(--muted)';
                  e.target.style.background = m.saved ? 'rgba(239, 68, 68, 0.1)' : 'white';
                }}>
                {savingIds.has(m.business_place_id || m.id) ? '...' : (m.saved ? '❤️ Saved' : '🤍 Save')}
              </button>
              
              <button style={{
                background: 'white',
                color: 'var(--muted)',
                border: '1px solid var(--hair)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: '1',
                minWidth: '100px'
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = 'var(--green)';
                e.target.style.color = 'var(--green)';
                e.target.style.background = 'rgba(44, 95, 52, 0.05)';
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = 'var(--hair)';
                e.target.style.color = 'var(--muted)';
                e.target.style.background = 'white';
              }}>
                ✨ Generate Pitch
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      <div ref={loader} style={{
        height: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'var(--space-xl)'
      }}>
        {loading && (
          <div style={{
            width: '240px',
            height: '8px',
            background: 'var(--bg)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: '40%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, var(--green), transparent)',
              borderRadius: 'var(--radius-sm)',
              animation: 'loading 1.5s infinite ease-in-out'
            }} />
          </div>
        )}
      </div>

      {/* Proposal Modal */}
      {modalMatch && (
        <ProposeDealModal
          match={modalMatch}
          athleteId={session?.user?.id}
          onClose={() => setModalMatch(null)}
        />
      )}
    </section>
  );
}
