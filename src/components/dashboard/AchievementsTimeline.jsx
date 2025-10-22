import React from 'react';
import { motion } from 'framer-motion';
import { useAchievements } from '../../hooks/useAchievements';
import { SkeletonText } from '../SkeletonLoaders.jsx';

export default function AchievementsTimeline(){
  const { achievements, loading } = useAchievements();
  return (
    <div className="card" aria-label="Achievements timeline">
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <div style={{fontWeight:800}}>Achievements</div>
        <button className="btn">+ Add New</button>
      </div>
      <div style={{marginTop:12}}>
        {loading && (
          <div style={{paddingLeft:16}}>
            <SkeletonText lines={3} />
          </div>
        )}
        {!loading && (
          <div style={{position:'relative',paddingLeft:16}}>
            <div style={{position:'absolute',left:7,top:0,bottom:0,width:2,background:'#f1f5f4'}} />
            {achievements?.map((a, index)=> (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                style={{padding:'8px 0 8px 24px'}}
              >
                <div style={{fontWeight:700}}>{a.title}</div>
                <div style={{color:'var(--muted)'}}>{a.date}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
