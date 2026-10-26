const mongoose = require('mongoose');
const Scan = require('../models/Scan');
const cfg = require('../config/scanConfig');
const { buildSubmission } = require('../validators/scanValidators');
const { ValidationError } = require('../validators/errors');
const { analyze, normalizeResult, AnalysisError } = require('../services/analysisClient');
const { removeFile } = require('../utils/tempFiles');

// POST /api/scans
// React submission -> validate -> identify input type -> call FastAPI -> return scan id + result
exports.createScan = async (req, res, next) => {
  const file = req.file; // present only for screenshot uploads (multipart)
  try {
    const submission = await buildSubmission(req.body, file);

    const scan = await Scan.create({
      user: req.user.id,
      inputType: submission.inputType,
      status: 'processing',
      input: {
        label: submission.label,
        hash: submission.hash,
        length: submission.length,
        meta: submission.meta,
        ...(cfg.retainContent && submission.content ? { content: submission.content } : {}),
      },
    });

    const started = Date.now();
    try {
      const raw = await analyze(submission, { scanId: String(scan._id), filePath: file?.path });
      scan.result = normalizeResult(raw);
      scan.status = 'completed';
    } catch (err) {
      if (!(err instanceof AnalysisError)) throw err;
      console.error(`Scan ${scan.id} analysis failed: ${err.message}`);
      scan.status = 'failed';
      scan.error = { code: err.code, message: err.publicMessage };
      scan.analysisMs = Date.now() - started;
      await scan.save();
      return res.status(err.httpStatus).json({ message: err.publicMessage, scanId: scan.id, status: 'failed' });
    }
    scan.analysisMs = Date.now() - started;
    await scan.save();

    res.status(201).json({
      scanId: scan.id,
      inputType: scan.inputType,
      status: scan.status,
      result: scan.result,
      createdAt: scan.createdAt,
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(err.status).json({ message: err.message, errors: err.fieldErrors });
    }
    next(err);
  } finally {
    // Always delete the temporary screenshot - success, validation error, or crash.
    if (file) await removeFile(file.path);
  }
};

// GET /api/scans/:id
exports.getScan = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Scan not found.' });
    const scan = await Scan.findOne({ _id: req.params.id, user: req.user.id });
    if (!scan) return res.status(404).json({ message: 'Scan not found.' });
    res.json({ scan: scan.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// GET /api/scans?page=1&limit=20
exports.listScans = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const filter = { user: req.user.id };
    const [items, total] = await Promise.all([
      Scan.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Scan.countDocuments(filter),
    ]);
    res.json({ scans: items.map((s) => s.toSafeObject()), page, limit, total });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/scans/:id  (users can erase their own scan records)
exports.deleteScan = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Scan not found.' });
    const deleted = await Scan.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Scan not found.' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
