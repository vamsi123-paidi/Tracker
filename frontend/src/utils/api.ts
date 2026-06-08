const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('holotrack_token');
  }
  return null;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('holotrack_token', token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('holotrack_token');
  }
};

interface FetchOptions extends RequestInit {
  token?: string;
}

const request = async (endpoint: string, options: FetchOptions = {}) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set Content-Type to JSON unless we are sending FormData (for files)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    removeAuthToken();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const api = {
  get: (endpoint: string) => request(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  put: (endpoint: string, body: any) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
  postFile: (endpoint: string, formData: FormData) =>
    request(endpoint, {
      method: 'POST',
      body: formData
    }),
  putFile: (endpoint: string, formData: FormData) =>
    request(endpoint, {
      method: 'PUT',
      body: formData
    })
};
