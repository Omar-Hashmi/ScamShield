import { useCallback, useState } from 'react';
import AppHeader from '../components/AppHeader.jsx';
import ModeTabs from '../components/scan/ModeTabs.jsx';
import TextAreaField from '../components/scan/TextAreaField.jsx';
import ImageDropzone from '../components/scan/ImageDropzone.jsx';
import ResultCard from '../components/scan/ResultCard.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import { AlertIcon, ImageIcon, LinkIcon, LockOutlineIcon, MessageIcon, PhoneIcon, ShieldCheckIcon } from '../components/Icons.jsx';
import { api } from '../api/client.js';
import { LIMITS, validateImage, validatePhone, validateText, validateUrl } from '../utils/scanRules.js';

const MODES = [
  { id: 'text', label: 'Message', icon: <MessageIcon size={18} /> },
  { id: 'url', label: 'Link', icon: <LinkIcon size={18} /> },
  { id: 'image', label: 'Screenshot', icon: <ImageIcon size={18} /> },
  { id: 'phone', label: 'Phone', icon: <PhoneIcon size={18} /> },
];

const COPY = {
  text: { title: 'Paste the message', hint: 'An SMS, WhatsApp message, email or social post. Urdu, English and mixed text all work.' },
  url: { title: 'Paste the link', hint: 'We analyse the address itself. You never need to open the link.' },
  image: { title: 'Upload a screenshot', hint: 'A chat, email, payment request or website you are unsure about.' },
  phone: { title: 'Enter the number', hint: 'The caller or sender. Local numbers (0300…) and international (+44…) both work, as do SMS short codes.' },
};

const VALIDATORS = { text: validateText, url: validateUrl, phone: validatePhone };

export default function NewScan() {
  const [mode, setMode] = useState('text');
  const [values, setValues] = useState({ text: '', url: '', phone: '' });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scan, setScan] = useState(null);

  const clearError = (key) => setErrors((er) => (er[key] ? { ...er, [key]: undefined } : er));

  const setValue = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    clearError(key);
    setFormError('');
  };

  const changeMode = (m) => { setMode(m); setErrors({}); setFormError(''); };

  const onFile = useCallback((f) => {
    if (!f) { setFile(null); setErrors((er) => ({ ...er, image: undefined })); return; }
    const problem = validateImage(f);
    setFile(problem ? null : f);
    setErrors((er) => ({ ...er, image: problem || undefined }));
    setFormError('');
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // block duplicate submissions
    setFormError('');

    const problem = mode === 'image' ? validateImage(file) : VALIDATORS[mode](values[mode]);
    if (problem) { setErrors({ [mode]: problem }); return; }
    setErrors({});

    let payload;
    if (mode === 'image') {
      payload = new FormData();
      payload.append('inputType', 'image');
      payload.append('image', file);
    } else {
      payload = { inputType: mode, [mode]: values[mode].trim() };
    }

    setLoading(true);
    try {
      setScan(await api.createScan(payload));
    } catch (err) {
      // Server-side field errors use the same keys: text | url | phone | image
      if (err.fieldErrors?.[mode]) setErrors({ [mode]: err.fieldErrors[mode] });
      else setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setScan(null);
    setValues({ text: '', url: '', phone: '' });
    setFile(null);
    setErrors({});
    setFormError('');
  };

  const copy = COPY[mode];

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="scan-main">
        <section className="scan-card reveal" style={{ '--i': 0 }} aria-labelledby="scan-heading">
          {scan ? (
            <ResultCard scan={scan} onReset={reset} />
          ) : (
            <>
              <h1 id="scan-heading">Check something suspicious</h1>
              <p className="subtitle">Send us what you received and we will tell you how risky it looks.</p>

              <ModeTabs modes={MODES} value={mode} onChange={changeMode} />

              <form onSubmit={onSubmit} noValidate>
                <div className="scan-panel" role="tabpanel" id="scan-panel" aria-labelledby={`scan-tab-${mode}`}>
                  <h2 className="panel-title">{copy.title}</h2>
                  <p className="panel-hint">{copy.hint}</p>

                  {formError && <div className="form-alert" role="alert"><AlertIcon /> {formError}</div>}

                  {mode === 'text' && (
                    <TextAreaField label="Message text" icon={<MessageIcon />} rows={7} max={LIMITS.maxText}
                      placeholder="e.g. Your account has been blocked. Send your OTP to reactivate…"
                      value={values.text} onChange={setValue('text')} error={errors.text} />
                  )}
                  {mode === 'url' && (
                    <TextField label="Link" icon={<LinkIcon />} placeholder="https://example.com/verify-account"
                      inputMode="url" autoComplete="off" autoCapitalize="off" spellCheck={false}
                      value={values.url} onChange={setValue('url')} error={errors.url} />
                  )}
                  {mode === 'phone' && (
                    <TextField label="Phone number" icon={<PhoneIcon />} placeholder="+92 300 1234567"
                      type="tel" inputMode="tel" autoComplete="off"
                      value={values.phone} onChange={setValue('phone')} error={errors.phone} />
                  )}
                  {mode === 'image' && <ImageDropzone file={file} onFile={onFile} error={errors.image} />}
                </div>

                <Button type="submit" loading={loading} loadingText="Analysing…">
                  <ShieldCheckIcon size={20} /> Check for scams
                </Button>
              </form>

              <p className="privacy-note">
                <LockOutlineIcon size={18} />
                <span>You choose what to send. ScamShield only analyses what you submit here and never monitors your messages or accounts. Screenshots are deleted from our server as soon as the scan finishes.</span>
              </p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
