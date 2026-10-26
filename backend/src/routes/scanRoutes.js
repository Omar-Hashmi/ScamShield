const express = require('express');
const protect = require('../middleware/auth');
const scanLimiter = require('../middleware/scanLimiter');
const uploadScreenshot = require('../middleware/uploadScreenshot');
const { createScan, getScan, listScans, deleteScan } = require('../controllers/scanController');

const router = express.Router();

// One endpoint, two body formats:
//   multipart/form-data  -> screenshot (field "image") handled by multer
//   application/json     -> text / url / phone
router.post('/', protect.optional, scanLimiter, uploadScreenshot, express.json({ limit: '64kb' }), createScan);
router.get('/', protect, listScans);
router.get('/:id', protect, getScan);
router.delete('/:id', protect, deleteScan);

module.exports = router;
