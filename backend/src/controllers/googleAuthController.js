const crypto = require('crypto');
const User = require('../models/User');
const { signToken } = require('./authController');

const COOKIE = 'scamshield_google_state';
const cookieOptions = `Path=/api/auth/google; HttpOnly; SameSite=Lax; Max-Age=600${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

function redirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
}

function frontendOrigin() {
  return (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');
}

function getCookie(req, name) {
  const value = (req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : '';
}

exports.start = (_req, res) => {
  const { GOOGLE_CLIENT_ID } = process.env;
  if (!GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).send('Google sign-in is not configured on the server.');
  }

  const state = crypto.randomBytes(32).toString('base64url');
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(state)}; ${cookieOptions}`);
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  }).toString();
  res.redirect(url.toString());
};

exports.callback = async (req, res) => {
  const { code, state, error } = req.query;
  const expectedState = getCookie(req, COOKIE);
  res.setHeader('Set-Cookie', `${COOKIE}=; ${cookieOptions.replace('Max-Age=600', 'Max-Age=0')}`);
  if (error) return res.redirect(`${frontendOrigin()}/login?oauth_error=cancelled`);
  if (!code || !state || !expectedState || state.length !== expectedState.length || !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expectedState))) {
    return res.redirect(`${frontendOrigin()}/login?oauth_error=state`);
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri(),
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.access_token) throw new Error('Google token exchange failed.');

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileResponse.json();
    if (!profileResponse.ok || !profile.email || profile.verified_email !== true) throw new Error('Google did not provide a verified email address.');

    const email = profile.email.trim().toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      try {
        user = await User.create({
          name: String(profile.name || email.split('@')[0]).slice(0, 80),
          email,
          password: crypto.randomBytes(48).toString('base64url'),
        });
      } catch (err) {
        if (err.code !== 11000) throw err;
        user = await User.findOne({ email });
      }
    }
    if (!user) throw new Error('Could not create your account.');

    const appToken = signToken(user, true);
    res.redirect(`${frontendOrigin()}/oauth/callback#token=${encodeURIComponent(appToken)}`);
  } catch (err) {
    console.error('Google sign-in failed:', err.message);
    res.redirect(`${frontendOrigin()}/login?oauth_error=failed`);
  }
};
