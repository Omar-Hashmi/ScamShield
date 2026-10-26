// Client-side checks for instant feedback. The server repeats every check - it is the authority.
export const LIMITS = {
  minText: 3,
  maxText: 5000,
  maxUrl: 2048,
  maxImageMB: 5,
  imageTypes: ['image/jpeg', 'image/png', 'image/webp'],
};
LIMITS.maxImageBytes = LIMITS.maxImageMB * 1024 * 1024;

export const validateText = (v) => {
  const t = v.trim();
  if (t.length < LIMITS.minText) return `Please paste at least ${LIMITS.minText} characters of the message.`;
  if (t.length > LIMITS.maxText) return `That message is too long. The limit is ${LIMITS.maxText} characters.`;
  return '';
};

export const validateUrl = (v) => {
  const t = v.trim();
  if (!t) return 'Please enter the link you want to check.';
  if (/\s/.test(t)) return 'A link cannot contain spaces. Paste only the link.';
  if (t.length > LIMITS.maxUrl) return `That link is too long. The limit is ${LIMITS.maxUrl} characters.`;
  if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(t) && !/^(https?|hxxps?):\/\//i.test(t)) return 'Only http:// and https:// links can be checked.';
  return '';
};

export const validatePhone = (v) => {
  const t = v.trim();
  if (!t) return 'Please enter the phone number.';
  if (!/^[+\d\s().-]+$/.test(t)) return 'Use digits only, with an optional + and country code.';
  const digits = t.replace(/\D/g, '').length;
  if (digits < 3 || digits > 15) return 'That does not look like a valid phone number. Include the country code, e.g. +92 300 1234567.';
  return '';
};

export const validateImage = (file) => {
  if (!file) return 'Please attach a screenshot to scan.';
  if (!LIMITS.imageTypes.includes(file.type)) return 'Unsupported file type. Upload a JPG, PNG or WebP screenshot.';
  if (file.size > LIMITS.maxImageBytes) return `That image is too large. The limit is ${LIMITS.maxImageMB} MB.`;
  if (file.size === 0) return 'That file is empty.';
  return '';
};

export const formatBytes = (n) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
