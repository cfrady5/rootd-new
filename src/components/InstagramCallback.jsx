import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useSocials from '../hooks/useSocials';

export default function InstagramCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleInstagramCallback } = useSocials();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setError(`Instagram authentication failed: ${error}`);
      setTimeout(() => navigate('/dashboard/profile'), 3000);
      return;
    }

    if (!code) {
      setStatus('error');
      setError('No authorization code received from Instagram');
      setTimeout(() => navigate('/dashboard/profile'), 3000);
      return;
    }

    // Process the callback
    handleInstagramCallback(code).then(result => {
      if (result.success) {
        setStatus('success');
        setTimeout(() => navigate('/dashboard/profile'), 2000);
      } else {
        setStatus('error');
        setError(result.error || 'Unknown error occurred');
        setTimeout(() => navigate('/dashboard/profile'), 3000);
      }
    });
  }, [searchParams, navigate, handleInstagramCallback]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '48px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        {status === 'processing' && (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid var(--border-color)',
              borderTop: '3px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 24px'
            }}></div>
            <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: '600' }}>
              Connecting Instagram...
            </h2>
            <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
              Please wait while we connect your Instagram account.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--color-primary)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: 'white',
              fontSize: '24px'
            }}>
              ✓
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: '600' }}>
              Instagram Connected!
            </h2>
            <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
              Redirecting you back to your profile...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#ff4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: 'white',
              fontSize: '24px'
            }}>
              ✕
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: '600' }}>
              Connection Failed
            </h2>
            <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
              {error}
            </p>
            <p style={{ margin: '16px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Redirecting you back...
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}