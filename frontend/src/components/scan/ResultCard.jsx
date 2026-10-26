import { useState } from 'react';
import { CheckIcon, CopyIcon } from '../Icons.jsx';

const VERDICTS = {
  safe: { label: 'Looks safe', tone: 'ok', note: 'No obvious scam signals were found. Stay careful with anything that asks for money or personal details.' },
  suspicious: { label: 'Suspicious', tone: 'warn', note: 'Some warning signs were found. Do not share personal details or click links until you have verified it.' },
  scam: { label: 'Likely a scam', tone: 'bad', note: 'This shows strong signs of fraud. Do not reply, pay, or share any codes or personal details.' },
  unknown: { label: 'Inconclusive', tone: 'muted', note: 'We could not reach a clear verdict. Treat it with caution.' },
};

const TYPE_LABEL = { text: 'Message', url: 'Link', image: 'Screenshot', phone: 'Phone number' };

// Compact summary shown straight after submission. The full explainability view is a later module.
export default function ResultCard({ scan, onReset }) {
  const [copied, setCopied] = useState(false);
  const { result } = scan;
  const v = VERDICTS[result.verdict] || VERDICTS.unknown;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(scan.scanId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked - ignore */ }
  };

  return (
    <div className="result" aria-live="polite">
      <div className={`verdict verdict-${v.tone}`}>
        <span className="verdict-dot" aria-hidden="true" />
        <div>
          <h2>{v.label}</h2>
          <p>{v.note}</p>
        </div>
      </div>

      {result.riskScore !== null && (
        <div className="risk">
          <div className="risk-head"><span>Risk score</span><strong>{result.riskScore}<small>/100</small></strong></div>
          <div className="risk-bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={result.riskScore} aria-label="Risk score">
            <span className={`risk-fill tone-${v.tone}`} style={{ width: `${result.riskScore}%` }} />
          </div>
        </div>
      )}

      {result.reasons.length > 0 && (
        <div className="reasons">
          <h3>Why we think so</h3>
          <ul>{result.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      )}

      {result.signals?.dataset === 'uci_sms_spam_collection' && (
        <p className="dataset-note">
          {result.signals.dataset_applicable
            ? 'Compared with English SMS examples. No dataset match cannot guarantee a message is safe.'
            : 'The English SMS dataset was not applicable to this message, so it did not affect the result.'}{' '}
          Source: <a href="https://doi.org/10.24432/C5CC84" target="_blank" rel="noreferrer">UCI SMS Spam Collection</a> (CC BY 4.0).
        </p>
      )}

      <div className="scan-id">
        <span>{TYPE_LABEL[scan.inputType]} scan ID</span>
        <code>{scan.scanId}</code>
        <button type="button" className="copy-btn" onClick={copyId} aria-label="Copy scan ID">
          {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
        </button>
      </div>

      <button type="button" className="btn-outline result-reset" onClick={onReset}>Scan something else</button>
    </div>
  );
}
