const jwt = require('jsonwebtoken');
const User = require('../models/User');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user, remember) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: remember
      ? process.env.JWT_EXPIRES_IN_REMEMBER || '30d'
      : process.env.JWT_EXPIRES_IN || '1d',
  });

exports.register = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const errors = {};
    if (name.length < 2) errors.name = 'Please enter your full name.';
    if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
    if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
    else if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
      errors.password = 'Password must include a letter and a number.';
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });

    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'An account with this email already exists.', errors: { email: 'This email is already registered.' } });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user, false), user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const remember = Boolean(req.body.remember);

    if (!EMAIL_RE.test(email) || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    // Same message for unknown email / wrong password to avoid account enumeration
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({ token: signToken(user, remember), user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'Account no longer exists.' });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};
