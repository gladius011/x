const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('vma-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.errors?.join(', ') || error.error || 'Request failed');
  }

  // Handle CSV responses
  if (res.headers.get('content-type')?.includes('text/csv')) {
    return res.text();
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  forgotPassword: (data) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  // User tests
  getUserTests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users/tests${query ? `?${query}` : ''}`);
  },

  // Tests
  createTest: (data) => request('/tests', { method: 'POST', body: JSON.stringify(data) }),
  getTests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/tests${query ? `?${query}` : ''}`);
  },
  getTestById: (id) => request(`/tests/${id}`),
  deleteTest: (id) => request(`/tests/${id}`, { method: 'DELETE' }),

  // Stats
  getStats: () => request('/stats'),

  // Export
  exportCSV: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const csvText = await request(`/tests/export/csv${query ? `?${query}` : ''}`);
    return csvText;
  },
};
