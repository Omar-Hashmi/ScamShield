import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import SocialButtons from '../components/SocialButtons.jsx';
import { MailIcon, LockIcon, UserIcon, AlertIcon, ArrowIcon } from '../components/Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++;
  if (/[A-Z]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  return s; // 0-4
}
const LABELS = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'];

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const score = useMemo(() => (form.password ? strength(form.password) : 0), [form.password]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (form.name.trim().length < 2) er.name = 'Please enter your full name.';
    if (!EMAIL_RE.test(form.email.trim())) er.email = 'Enter a valid email address.';
    if (form.password.length < 8) er.password = 'Use at least 8 characters.';
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      er.password = 'Include at least one letter and one number.';
    if (form.confirm !== form.password) er.confirm = 'Passwords do not match.';
    return er;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setFormError('');
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setFormError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout topText="Already have an account?" topLinkText="Log In" topLinkTo="/login">
      <div className="reveal" style={{ '--i': 1 }}>
        <h1>Create Account</h1>
        <p className="subtitle">Join ScamShield AI and stay protected</p>
      </div>

      <form onSubmit={onSubmit} noValidate>
        {formError && <div className="form-alert" role="alert"><AlertIcon /> {formError}</div>}

        <div className="reveal" style={{ '--i': 2 }}>
          <TextField label="Full Name" icon={<UserIcon />} placeholder="Your name" autoComplete="name"
            value={form.name} onChange={set('name')} error={errors.name} />
        </div>
        <div className="reveal" style={{ '--i': 3 }}>
          <TextField label="Email Address" type="email" icon={<MailIcon />} placeholder="you@example.com" autoComplete="email"
            value={form.email} onChange={set('email')} error={errors.email} />
        </div>
        <div className="reveal" style={{ '--i': 4 }}>
          <TextField label="Password" type="password" icon={<LockIcon />} placeholder="At least 8 characters"
            autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
          {form.password && (
            <div className="meter" aria-live="polite">
              <div className="meter-bars">
                {[1, 2, 3, 4].map((n) => <span key={n} className={n <= score ? `on s${score}` : ''} />)}
              </div>
              <span className="meter-label">{LABELS[score]}</span>
            </div>
          )}
        </div>
        <div className="reveal" style={{ '--i': 5 }}>
          <TextField label="Confirm Password" type="password" icon={<LockIcon />} placeholder="Re-enter your password"
            autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        </div>

        <div className="reveal" style={{ '--i': 6 }}>
          <Button type="submit" loading={loading} loadingText="Creating account…">Create Account <ArrowIcon /></Button>
        </div>
      </form>

      <div className="reveal" style={{ '--i': 7 }}><SocialButtons /></div>

      <p className="switch mobile-only">
        Already have an account? <Link to="/login" className="link">Log in</Link>
      </p>
    </AuthLayout>
  );
}
