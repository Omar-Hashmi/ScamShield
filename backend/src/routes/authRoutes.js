const router = require('express').Router();
const { register, login, me } = require('../controllers/authController');
const googleAuth = require('../controllers/googleAuthController');
const protect = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/google', googleAuth.start);
router.get('/google/callback', googleAuth.callback);
router.get('/me', protect, me);

module.exports = router;
