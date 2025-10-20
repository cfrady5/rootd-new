import React from 'react';
import { Link } from 'react-router-dom';

export default function FooterCTA() {
  return (
    <div>
      {/* Footer CTA */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green) 0%, #2d7a3a 100%)',
        padding: '80px 40px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '700',
          margin: '0 0 16px',
          letterSpacing: '-0.02em'
        }}>
          Ready to grow your brand?
        </h2>
        <p style={{
          fontSize: '21px',
          margin: '0 0 40px',
          opacity: 0.9
        }}>
          Join thousands of athletes building partnerships with top brands.
        </p>
        <Link
          to="/signup"
          style={{
            display: 'inline-block',
            background: 'white',
            color: 'var(--green)',
            padding: '16px 40px',
            borderRadius: '14px',
            fontSize: '17px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Get Started for Free
        </Link>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '60px 40px',
        background: '#1d1d1f',
        color: '#f5f5f7'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '60px',
          marginBottom: '40px',
          textAlign: 'left'
        }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#f5f5f7', margin: '0 0 16px 0' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/demo" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Features</Link>
              <Link to="/pricing" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Pricing</Link>
              <Link to="/demo" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Demo</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#f5f5f7', margin: '0 0 16px 0' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/about" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>About</Link>
              <Link to="/contact" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Contact</Link>
              <Link to="/director" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Careers</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#f5f5f7', margin: '0 0 16px 0' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/about" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Blog</Link>
              <Link to="/about" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Help Center</Link>
              <Link to="/about" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>API Docs</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#f5f5f7', margin: '0 0 16px 0' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/about" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Privacy</Link>
              <Link to="/about" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Terms</Link>
              <Link to="/about" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Security</Link>
            </div>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid #424245',
          paddingTop: '40px',
          fontSize: '12px',
          color: '#86868b',
          textAlign: 'center'
        }}>
          © 2025 rootd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
