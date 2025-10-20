import React, { useEffect, useState } from 'react';
import { FadeUp } from './Animations.jsx';

function CountUp({ value = 0, suffix = '' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let mounted = true;
    const dur = 1200;
    const start = Date.now();
    const from = 0;
    const to = value;
    function tick() {
      if (!mounted) return;
      const pct = Math.min(1, (Date.now() - start) / dur);
      const easedPct = 1 - Math.pow(1 - pct, 3); // Ease out cubic
      setN(Math.round(from + (to - from) * easedPct));
      if (pct < 1) requestAnimationFrame(tick);
    }
    tick();
    return () => mounted = false;
  }, [value]);
  return (
    <span style={{
      fontWeight: '700',
      fontSize: '32px',
      color: 'var(--ink)',
      fontFeatureSettings: '"tnum"' // Tabular numbers for consistency
    }}>
      {n}{suffix}
    </span>
  );
}

export default function MetricCards() {
  const metrics = [
    { 
      label: 'Total Matches', 
      value: 124, 
      trend: 5, 
      icon: '🎯',
      color: 'var(--green)'
    },
    { 
      label: 'Active Deals', 
      value: 6, 
      trend: -2, 
      icon: '🤝',
      color: 'var(--warning)'
    },
    { 
      label: 'New Businesses', 
      value: 18, 
      trend: 12, 
      icon: '🏢',
      color: 'var(--success)'
    },
    { 
      label: 'Match Score', 
      value: 82, 
      trend: 3, 
      icon: '⭐',
      color: 'var(--green)',
      suffix: '%'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 'var(--space-lg)',
      marginBottom: 'var(--space-xl)'
    }}>
      {metrics.map((metric, i) => (
        <FadeUp key={metric.label} delay={i * 100}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            border: '1px solid var(--hair)',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}>
            
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, ${metric.color}15, ${metric.color}05)`,
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            {/* Icon */}
            <div style={{
              fontSize: '24px',
              marginBottom: 'var(--space-md)',
              position: 'relative',
              zIndex: 1
            }}>
              {metric.icon}
            </div>

            {/* Main metric */}
            <div style={{
              marginBottom: 'var(--space-sm)',
              position: 'relative',
              zIndex: 1
            }}>
              <CountUp value={metric.value} suffix={metric.suffix} />
            </div>

            {/* Label and trend */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <span style={{
                fontSize: '15px',
                fontWeight: '500',
                color: 'var(--muted)',
                lineHeight: '1.2'
              }}>
                {metric.label}
              </span>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: metric.trend >= 0 ? 'rgba(48, 209, 88, 0.1)' : 'rgba(255, 69, 58, 0.1)',
                color: metric.trend >= 0 ? 'var(--success)' : 'var(--danger)',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                <span>{metric.trend >= 0 ? '↗' : '↘'}</span>
                <span>{Math.abs(metric.trend)}%</span>
              </div>
            </div>

            {/* Subtle border accent */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, ${metric.color}, ${metric.color}80)`,
              borderRadius: '0 0 var(--radius-lg) var(--radius-lg)'
            }} />
          </div>
        </FadeUp>
      ))}
    </div>
  );
}
