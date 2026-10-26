const express = require('express');
const protect = require('../middleware/auth');
const scanLimiter = require('../middleware/scanLimiter');
const uploadScreenshot = require('../middleware/uploadScreenshot');
const { createScan, getScan, listScans, deleteScan } = require('../controllers/scanController');

const router = express.Router();

// Users must be signed in: submissions are voluntary and tied to their account.
router.use(protect);

// One endpoint, two body formats:
//   multipart/form-data  -> screenshot (field "image") handled by multer
//   application/json     -> text / url / phone
router.post('/', scanLimiter, uploadScreenshot, express.json({ limit: '64kb' }), createScan);
router.get('/', listScans);
router.get('/:id', getScan);
router.delete('/:id', deleteScan);

module.exports = router;
