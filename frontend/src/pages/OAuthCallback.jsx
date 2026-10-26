import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function OAuthCallback() {
  const { completeOAuth } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    window.history.replaceState(null, '', window.location.pathname);
    if (!token) {
      setError('Google sign-in did not return a valid session. Please try again.');
      return;
    }
    completeOAuth(token)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setError('Could not complete Google sign-in. Please try again.'));
  }, [completeOAuth, navigate]);

  return (
    <main className="oauth-callback">
      <div className="oauth-callback-card" role={error ? 'alert' : 'status'}>
        <span className="oauth-callback-mark" aria-hidden="true">{error ? '!' : '✓'}</span>
        <h1>{error ? 'Sign-in unsuccessful' : 'Signing you in'}</h1>
        <p>{error || 'Finishing your secure Google sign-in…'}</p>
        {error && <button type="button" className="header-btn" onClick={() => navigate('/login', { replace: true })}>Back to login</button>}
      </div>
    </main>
  );
}
