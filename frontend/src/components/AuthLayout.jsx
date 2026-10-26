import BrandPanel from './BrandPanel.jsx';
import Logo from './Logo.jsx';

export default function AuthLayout({ children }) {
  return (
    <main className="auth-shell">
      <BrandPanel />
      <section className="form-panel">
        <div className="mobile-logo"><Logo variant="dark" size={44} /></div>
        <div className="form-wrap">{children}</div>
      </section>
    </main>
  );
}
