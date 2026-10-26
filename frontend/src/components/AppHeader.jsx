import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Top bar for signed-in pages. Reused by later modules (history, results, admin).
export default function AppHeader() {
  const { user, logout } = useAuth();
  return (
    <header className="app-header">
      <Link to="/dashboard" aria-label="ScamShield AI home"><Logo variant="dark" size={34} /></Link>
      <div className="app-header-right">
        <span className="app-user">{user.name.split(' ')[0]}</span>
        <button type="button" className="header-btn" onClick={logout}>Sign out</button>
      </div>
    </header>
  );
}
