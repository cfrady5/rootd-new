import React from 'react';
import { motion } from 'framer-motion';
import { usePersona } from '../../hooks/usePersona';
import { SkeletonText } from '../SkeletonLoaders.jsx';

export default function BrandPersona() {
  const { persona, loading } = usePersona();

  return (
    <div className="card" aria-label="Brand and persona">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontWeight:800}}>Brand & Personality</div>
        <div style={{fontSize:13,color:'var(--muted)'}} title="Explain my matches" aria-label="Explain my matches" onClick={() => console.log('event: explain_matches')}>Explain</div>
      </div>
      {loading && (
        <div style={{marginTop:12}}>
          <SkeletonText lines={2} />
        </div>
      )}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{marginTop:8,display:'flex',gap:8,flexWrap:'wrap'}}
        >
          {(persona?.traits || ['Friendly','Driven','Engaging']).map((t, index) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              style={{background:'#F3F9F6',color:'var(--accent-700)',padding:'6px 10px',borderRadius:999,fontWeight:700}}
            >
              {t}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
