const crypto = require('crypto');
const multer = require('multer');
const cfg = require('../config/scanConfig');
const { ensureTempDir, TEMP_SUFFIX } = require('../utils/tempFiles');

ensureTempDir();

class UploadError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const upload = multer({
  // Disk storage in a private temp folder; the controller deletes the file as soon as analysis ends.
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, cfg.tempDir),
    filename: (_req, _file, cb) => cb(null, `${crypto.randomUUID()}${TEMP_SUFFIX}`), // never trust the client's file name
  }),
  limits: { fileSize: cfg.maxImageBytes, files: 1, fields: 10, fieldSize: 64 * 1024, parts: 12 },
  fileFilter: (_req, file, cb) => {
    if (!cfg.allowedImageMimes.has(file.mimetype)) {
      return cb(new UploadError(415, 'Unsupported file type. Upload a JPG, PNG or WebP screenshot.'));
    }
    cb(null, true);
  },
}).single('image');

const mb = Math.round(cfg.maxImageBytes / 1024 / 1024);

// Wraps multer so every upload problem becomes the same JSON error shape as the rest of the API.
module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next();
    let status = 400;
    let message = 'The upload could not be processed. Please try again.';
    if (err instanceof UploadError) ({ status, message } = err);
    else if (err.code === 'LIMIT_FILE_SIZE') { status = 413; message = `That image is too large. The limit is ${mb} MB.`; }
    else if (err.code === 'LIMIT_UNEXPECTED_FILE') message = 'Unexpected file. Attach the screenshot using the "image" field.';
    else if (err.code === 'LIMIT_FILE_COUNT') message = 'Please upload one screenshot at a time.';
    else if (err instanceof multer.MulterError) message = 'The upload was rejected. Please check the file and try again.';
    res.status(status).json({ message, errors: { image: message } });
  });
};
