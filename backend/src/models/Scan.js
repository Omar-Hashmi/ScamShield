const mongoose = require('mongoose');
const cfg = require('../config/scanConfig');

const scanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    inputType: { type: String, enum: ['text', 'url', 'image', 'phone'], required: true },
    status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing', index: true },

    // What was submitted. By default only a short label + keyed hash + metadata are kept (see SCAN_RETAIN_CONTENT).
    input: {
      label: { type: String, maxlength: 80 },
      hash: { type: String },
      length: { type: Number },
      content: { type: String, select: false }, // only filled when SCAN_RETAIN_CONTENT=true
      meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    },

    // Normalised output of the FastAPI analysis (see analysisClient.normalizeResult)
    result: { type: mongoose.Schema.Types.Mixed, default: null },
    error: { code: String, message: String },
    analysisMs: Number,

    // MongoDB deletes the document automatically once this date passes.
    expiresAt: { type: Date, default: () => new Date(Date.now() + cfg.retentionDays * 86400000), index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

scanSchema.index({ user: 1, createdAt: -1 });

scanSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    inputType: this.inputType,
    status: this.status,
    input: { label: this.input?.label, length: this.input?.length, meta: this.input?.meta },
    result: this.result,
    error: this.error?.message ? { code: this.error.code, message: this.error.message } : null,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Scan', scanSchema);
