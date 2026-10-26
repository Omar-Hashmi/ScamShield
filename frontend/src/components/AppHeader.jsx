import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useState } from 'react';

// Top bar for signed-in pages. Reused by later modules (history, results, admin).
export default function AppHeader() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('scamshield-theme') === 'dark'; }
    catch { return false; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    try { localStorage.setItem('scamshield-theme', next ? 'dark' : 'light'); }
    catch { /* Theme still works for this page if storage is unavailable. */ }
  };

  return (
    <header className="app-header">
      <Link to="/dashboard" aria-label="ScamShield AI home"><Logo variant="dark" size={34} /></Link>
      <nav className="app-header-right" aria-label="Account navigation">
        <button type="button" className="header-btn theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} aria-pressed={dark}>
          <span aria-hidden="true">{dark ? '☀' : '☾'}</span> {dark ? 'Light mode' : 'Dark mode'}
        </button>
        {user ? (
          <>
            <Link className="header-nav-link" to="/history">Scan history</Link>
            <span className="app-user">{user.name.split(' ')[0]}</span>
            <button type="button" className="header-btn" onClick={logout}>Sign out</button>
          </>
        ) : (
          <>
            <Link className="header-nav-link" to="/login">Sign in to save history</Link>
            <Link className="header-btn header-login" to="/login">Log in</Link>
          </>
        )}
      </nav>
    </header>
  );
}
