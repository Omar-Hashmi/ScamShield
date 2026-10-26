import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewScan from './pages/NewScan.jsx';
import OAuthCallback from './pages/OAuthCallback.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash" aria-busy="true">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash" aria-busy="true">Loading…</div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/scan" element={<Protected><NewScan /></Protected>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
