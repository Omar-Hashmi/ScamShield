import { useState } from 'react';
import { AppleIcon, GoogleIcon } from './Icons.jsx';

export default function SocialButtons() {
  const [notice, setNotice] = useState('');
  const click = (provider) => () =>
    setNotice(`${provider} sign-in isn't available yet. Please continue with email and password.`);

  return (
    <>
      <div className="or" role="separator"><span>or</span></div>
      <div className="social">
        <button type="button" className="btn-social google" onClick={() => { window.location.assign('/api/auth/google'); }}>
          <GoogleIcon /> Continue with Google
        </button>
        <button type="button" className="btn-social apple" onClick={click('Apple')}>
          <AppleIcon /> Continue with Apple
        </button>
      </div>
      {notice && <p className="notice" role="status">{notice}</p>}
    </>
  );
}
