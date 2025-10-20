import React, { useState, useRef, useEffect } from 'react';
import { useMatches } from '../../hooks/useMatches';

export default function MatchesGrid() {
  const { matches, loading, loadMore } = useMatches();
  const [selected, setSelected] = useState(new Set());
  const loader = useRef();

  useEffect(()=>{
    const node = loader.current;
    if (!node) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    });
    obs.observe(node);
    return ()=>obs.disconnect();
  },[loadMore]);

  return (
    <div style={{ padding: 'var(--space-lg)' }}>
      {/* Header Controls */}
      <div style={{
        marginBottom: 'var(--space-xl)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-md)',
        background: 'white',
        padding: 'var(--space-lg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--hair)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <select style={{
            padding: '12px 16px',
            border: '1px solid var(--hair)',
            borderRadius: 'var(--radius-md)',
            background: 'white',
            fontSize: '15px',
            fontWeight: '500',
            color: 'var(--ink)',
            cursor: 'pointer',
            outline: 'none'
          }}>
            <option>All categories</option>
            <option>Fitness</option>
            <option>Nutrition</option>
          </select>
          
          <select style={{
            padding: '12px 16px',
            border: '1px solid var(--hair)',
            borderRadius: 'var(--radius-md)',
            background: 'white',
            fontSize: '15px',
            fontWeight: '500',
            color: 'var(--ink)',
            cursor: 'pointer',
            outline: 'none'
          }}>
            <option>Any distance</option>
            <option>Within 5 miles</option>
            <option>Within 25 miles</option>
          </select>
          
          <input 
            placeholder="Min score %" 
            style={{
              padding: '12px 16px',
              border: '1px solid var(--hair)',
              borderRadius: 'var(--radius-md)',
              background: 'white',
              fontSize: '15px',
              fontWeight: '500',
              color: 'var(--ink)',
              outline: 'none',
              width: '140px'
            }}
          />
        </div>
        
        {selected.size > 0 && (
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <span style={{
              background: 'var(--bg)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--muted)'
            }}>
              {selected.size} selected
            </span>
            <button 
              onClick={()=>{console.log('batch: save',Array.from(selected));}}
              style={{
                background: 'white',
                color: 'var(--green)',
                border: '1px solid var(--green)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              💾 Save
            </button>
            <button 
              onClick={()=>{console.log('batch: propose',Array.from(selected));}}
              style={{
                background: 'var(--green)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              💼 Propose All
            </button>
          </div>
        )}
      </div>

      {/* Matches Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 'var(--space-lg)'
      }}>
        {loading && !matches?.length && (
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'var(--space-xl)',
            color: 'var(--muted)',
            fontSize: '17px'
          }}>
            Loading amazing matches...
          </div>
        )}
        
        {matches?.map(m => (
          <div key={m.id} style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            border: selected.has(m.id) ? '2px solid var(--green)' : '1px solid var(--hair)',
            boxShadow: selected.has(m.id) ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            cursor: 'pointer'
          }}
          onClick={() => {
            const s = new Set(selected);
            s.has(m.id) ? s.delete(m.id) : s.add(m.id);
            setSelected(s);
          }}
          onMouseEnter={e => {
            if (!selected.has(m.id)) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = 'var(--shadow-md)';
            }
          }}
          onMouseLeave={e => {
            if (!selected.has(m.id)) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'var(--shadow-sm)';
            }
          }}
          role="article">
            
            {/* Selection Indicator */}
            <div style={{
              position: 'absolute',
              top: 'var(--space-md)',
              right: 'var(--space-md)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: selected.has(m.id) ? 'none' : '2px solid var(--hair)',
              background: selected.has(m.id) ? 'var(--green)' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: 'white',
              transition: 'all 0.2s ease'
            }}>
              {selected.has(m.id) && '✓'}
            </div>

            {/* Business Info */}
            <div style={{ marginBottom: 'var(--space-lg)', paddingRight: '40px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--ink)',
                margin: '0 0 8px 0',
                lineHeight: '1.3'
              }}>
                {m.business_name}
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
                <span>{m.distance}mi</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Save individual:', m.id);
                }}
                style={{
                  background: 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: '1'
                }}
              >
                💾 Save
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Propose to:', m.id);
                }}
                style={{
                  background: 'white',
                  color: 'var(--muted)',
                  border: '1px solid var(--hair)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: '1'
                }}
              >
                💼 Propose
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Explain score for:', m.id);
                }}
                style={{
                  background: 'white',
                  color: 'var(--muted)',
                  border: '1px solid var(--hair)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: '1'
                }}
              >
                📊 Score
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
        {loading && matches?.length > 0 && (
          <div style={{
            color: 'var(--muted)',
            fontSize: '15px',
            fontWeight: '500'
          }}>
            Loading more matches...
          </div>
        )}
      </div>
    </div>
  );
}
