import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import { ImageIcon, LinkIcon, MessageIcon, ShieldCheckIcon } from '../components/Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const options = [
  { icon: <MessageIcon size={22} />, title: 'Messages', detail: 'SMS, emails and social posts' },
  { icon: <LinkIcon size={22} />, title: 'Web links', detail: 'Check a link before opening it' },
  { icon: <ImageIcon size={22} />, title: 'Screenshots', detail: 'Upload a suspicious conversation' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';

  return (
    <div className="dashboard-page">
      <AppHeader />
      <main className="dashboard-main">
        <div className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">YOUR SCAMSHIELD DASHBOARD</p>
            <h1>Good to see you, {firstName}</h1>
            <p className="dashboard-subtitle">Check something that doesn’t feel right. We’ll help you spot the warning signs.</p>
          </div>
          <div className="dashboard-protected"><ShieldCheckIcon size={18} /> Your account is protected</div>
        </div>

        <section className="dashboard-hero" aria-labelledby="dashboard-action-title">
          <div className="dashboard-hero-copy">
            <span className="dashboard-hero-kicker">PAUSE. CHECK. STAY SAFE.</span>
            <h2 id="dashboard-action-title">Not sure if it’s a scam?</h2>
            <p>Share a message, link, phone number or screenshot for a quick risk check.</p>
            <Link className="dashboard-cta" to="/scan">Check suspicious content <span aria-hidden="true">→</span></Link>
          </div>
          <div className="dashboard-shield-art" aria-hidden="true"><ShieldCheckIcon size={74} /></div>
        </section>

        <section className="dashboard-options" aria-labelledby="dashboard-options-title">
          <div className="dashboard-section-heading">
            <div>
              <h2 id="dashboard-options-title">What would you like to check?</h2>
              <p>Choose a type of suspicious content to get started.</p>
            </div>
            <Link className="dashboard-text-link" to="/scan">Open checker <span aria-hidden="true">→</span></Link>
          </div>
          <div className="dashboard-option-grid">
            {options.map((option) => (
              <Link className="dashboard-option" to="/scan" key={option.title}>
                <span className="dashboard-option-icon">{option.icon}</span>
                <span className="dashboard-option-copy"><strong>{option.title}</strong><span>{option.detail}</span></span>
                <span className="dashboard-option-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
        <p className="dashboard-footnote"><ShieldCheckIcon size={16} /> Your checks are private. Only submit content you choose to share.</p>
      </main>
    </div>
  );
}
