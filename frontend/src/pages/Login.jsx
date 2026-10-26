import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import SocialButtons from '../components/SocialButtons.jsx';
import { MailIcon, LockIcon, AlertIcon, ArrowIcon } from '../components/Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.email.trim()) er.email = 'Email is required.';
    else if (!EMAIL_RE.test(form.email.trim())) er.email = 'Enter a valid email address.';
    if (!form.password) er.password = 'Password is required.';
    return er;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // block duplicate submissions
    setFormError('');
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password, remember: form.remember });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout topText="Don't have an account?" topLinkText="Sign Up" topLinkTo="/signup">
      <div className="reveal" style={{ '--i': 1 }}>
        <h1>Welcome Back</h1>
        <p className="subtitle">Login to your ScamShield AI account</p>
      </div>

      <form onSubmit={onSubmit} noValidate>
        {formError && <div className="form-alert" role="alert"><AlertIcon /> {formError}</div>}

        <div className="reveal" style={{ '--i': 2 }}>
          <TextField label="Email Address" type="email" icon={<MailIcon />} placeholder="you@example.com"
            autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        </div>
        <div className="reveal" style={{ '--i': 3 }}>
          <TextField label="Password" type="password" icon={<LockIcon />} placeholder="Enter your password"
            autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} />
        </div>

        <div className="row reveal" style={{ '--i': 4 }}>
          <label className="check">
            <input type="checkbox" checked={form.remember} onChange={set('remember')} />
            <span className="box" aria-hidden="true" />
            Remember me
          </label>
          {/* Password reset is not part of this release */}
          <a href="#" className="link" onClick={(e) => e.preventDefault()}>Forgot password?</a>
        </div>

        <div className="reveal" style={{ '--i': 5 }}>
          <Button type="submit" loading={loading} loadingText="Logging in…">Log In <ArrowIcon /></Button>
        </div>
      </form>

      <div className="reveal" style={{ '--i': 6 }}><SocialButtons /></div>

      <p className="switch mobile-only">
        New to ScamShield? <Link to="/signup" className="link">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
