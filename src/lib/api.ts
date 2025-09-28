import axios from 'axios';

// Unified API base strategy:
// - VITE_API_BASE should point to the root of the backend (without trailing slash) e.g.:
//     ''                             (same-origin dev via proxy)
//     'http://localhost:8000'        (direct dev)
//     'https://api.bairengroup.com'  (production)
// We append '/api/' internally for DRF endpoints where appropriate.
// If VITE_API_BASE is not set we fallback to localhost.
const RAW_BASE = (import.meta.env.VITE_API_BASE ?? '').trim();
const BASE = RAW_BASE === '' ? 'http://localhost:8000' : RAW_BASE.replace(/\/$/, '');

// Helper to build paths ensuring single slashes and trailing slash for DRF list endpoints
const join = (...parts: string[]) => parts
  .map(p => p.trim())
  .filter(Boolean)
  .map((p, i) => i === 0 ? p.replace(/\/$/, '') : p.replace(/^\//, '').replace(/\/$/, ''))
  .join('/')
  .replace(/\/+/g, '/');

// API namespace root (always with trailing slash for DRF)
const API_ROOT = join(BASE, 'api') + '/';

const api = axios.create({ baseURL: API_ROOT });

// Single-flight control for refresh to avoid multiple parallel refresh calls
let isRefreshing = false as boolean;
type QueueItem = { resolve: (value: any) => void; reject: (error: any) => void };
const failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  while (failedQueue.length) {
    const { resolve, reject } = failedQueue.shift()!;
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  }
};

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token');
  if (token) cfg.headers!['Authorization'] = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config || {};
    const status = err.response?.status;
    const url = (originalRequest.url || '') as string;

    // Never try to refresh on auth endpoints themselves
    const isAuthEndpoint = url.includes('/users/login') || url.includes('/users/token/refresh');

    if (status === 401 && !isAuthEndpoint) {
      const req: any = originalRequest; // allow custom flags

      // Prevent retry loops per-request
      if (req._retry) {
        return Promise.reject(err);
      }

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        localStorage.clear();
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(err);
      }

      // Queue requests while one refresh is in flight
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            req._retry = true;
            req.headers = req.headers || {};
            req.headers['Authorization'] = `Bearer ${newToken}`;
            return api(req);
          })
          .catch((queueErr) => Promise.reject(queueErr));
      }

      req._retry = true;
      isRefreshing = true;

      try {
        // Use a clean client without interceptors for refresh
  const refreshClient = axios.create({ baseURL: API_ROOT });
  const { data } = await refreshClient.post('users/token/refresh/', { refresh: refreshToken });

        if (data?.access) {
          localStorage.setItem('access_token', data.access);
          isRefreshing = false;
          processQueue(null, data.access);
          req.headers = req.headers || {};
          req.headers['Authorization'] = `Bearer ${data.access}`;
          return api(req);
        } else {
          throw new Error('No se recibió nuevo access token');
        }
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        localStorage.clear();
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
  const response = await api.post('users/login/', { email, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    return response.data;
  },
  
  getMe: async () => {
  const response = await api.get('users/me/');
    return response;
  },
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.clear();
};

export const deleteProperty = async (id: number) => {
  try {
  await api.delete(`properties/${id}/`);
    alert('Propiedad eliminada');
  } catch (error) {
    alert('Error al eliminar la propiedad');
    console.error(error);
  }
};

export const endpoints = {
  properties: () => 'properties/',
  property: (id: number) => `properties/${id}/`,
  users: () => 'users/',
  user: (id: number) => `users/${id}/`,
  bookings: () => 'bookings/',
  blocks: () => 'blocks/',
  login: () => 'users/login/',
  refresh: () => 'users/token/refresh/',
  me: () => 'users/me/',
};

export { API_ROOT, BASE as API_BASE };
export default api;
