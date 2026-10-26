// Thrown by validators; the controller turns it into a 400 { message, errors } response
// (same shape the auth endpoints already use, so the frontend handles both the same way).
class ValidationError extends Error {
  constructor(message, fieldErrors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.fieldErrors = fieldErrors;
  }
}

const fail = (field, message) => {
  throw new ValidationError(message, { [field]: message });
};

module.exports = { ValidationError, fail };
