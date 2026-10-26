import { Link } from 'react-router-dom';
import BrandPanel from './BrandPanel.jsx';
import Logo from './Logo.jsx';

export default function AuthLayout({ topText, topLinkText, topLinkTo, children }) {
  return (
    <main className="auth-shell">
      <BrandPanel />
      <section className="form-panel">
        <div className="topbar reveal" style={{ '--i': 0 }}>
          {topText} <Link to={topLinkTo} className="top-link">{topLinkText}</Link>
        </div>
        <div className="mobile-logo"><Logo variant="dark" size={44} /></div>
        <div className="form-wrap">{children}</div>
      </section>
    </main>
  );
}
