// Thin fetch wrapper. Token lives in localStorage ("remember me") or sessionStorage.
const KEY = 'scamshield_token';

export const tokenStore = {
  get: () => localStorage.getItem(KEY) || sessionStorage.getItem(KEY),
  set: (token, persist) => {
    tokenStore.clear();
    (persist ? localStorage : sessionStorage).setItem(KEY, token);
  },
  clear: () => {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  },
};

export class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors || {};
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const token = tokenStore.get();
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: {
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || 'Something went wrong.', res.status, data.errors);
  return data;
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),
  createScan: (payload) => request('/scans', { method: 'POST', body: payload }),
};
