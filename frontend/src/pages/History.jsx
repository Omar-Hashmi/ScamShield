import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import { api } from '../api/client.js';

const LABELS = { text: 'Message', url: 'Link', image: 'Screenshot', phone: 'Phone number' };
const verdictLabel = { safe: 'Looks safe', suspicious: 'Suspicious', scam: 'Likely a scam', unknown: 'Inconclusive' };

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listScans()
      .then((data) => setScans(data.scans || []))
      .catch((err) => setError(err.message || 'Could not load your scan history.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-page">
      <AppHeader />
      <main className="history-main">
        <p className="dashboard-eyebrow">YOUR ACCOUNT</p>
        <h1>Scan history</h1>
        <p className="dashboard-subtitle">Results saved while you were signed in.</p>
        {loading && <p className="history-state">Loading your history…</p>}
        {error && <p className="form-alert" role="alert">{error}</p>}
        {!loading && !error && scans.length === 0 && (
          <section className="history-empty">
            <h2>No saved scans yet</h2>
            <p>Sign in keeps future scan results here. You can check suspicious content without signing in.</p>
            <Link className="dashboard-cta" to="/scan">Check suspicious content <span aria-hidden="true">→</span></Link>
          </section>
        )}
        {scans.length > 0 && (
          <div className="history-list">
            {scans.map((scan) => {
              const verdict = scan.result?.verdict || 'unknown';
              return (
                <article className="history-item" key={scan.id}>
                  <div className="history-item-top">
                    <span className={`history-verdict history-${verdict}`}>{verdictLabel[verdict] || verdictLabel.unknown}</span>
                    <time dateTime={scan.createdAt}>{new Date(scan.createdAt).toLocaleString()}</time>
                  </div>
                  <strong>{LABELS[scan.inputType] || 'Scan'}: {scan.input?.label || 'Submitted content'}</strong>
                  {scan.result?.riskScore !== null && scan.result?.riskScore !== undefined && <span className="history-score">Risk score {scan.result.riskScore}/100</span>}
                  {scan.result?.reasons?.length > 0 && <p>{scan.result.reasons[0]}</p>}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
