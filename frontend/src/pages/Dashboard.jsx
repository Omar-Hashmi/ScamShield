import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Placeholder landing page after login. Replace with the real scan/results UI later.
export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <main className="dash-page">
      <div className="dash-card reveal" style={{ '--i': 0 }}>
        <Logo variant="dark" size={48} />
        <h1>Hello, {user.name.split(' ')[0]} 👋</h1>
        <p className="subtitle">You're signed in as {user.email}. The scanning dashboard will live here.</p>
        <button className="btn-outline" onClick={logout}>Sign out</button>
      </div>
    </main>
  );
}
