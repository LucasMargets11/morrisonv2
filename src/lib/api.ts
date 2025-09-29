import axios from 'axios';

// ================================================================
// API Base Resolution (production-safe)
//
// Primary new convention:
//   VITE_API_BASE   -> e.g. https://api.bairengroup.com   (NO trailing slash)
//   VITE_API_PREFIX -> e.g. /api                         (OPTIONAL, with or without leading slash)
// Combines into: `${VITE_API_BASE}${VITE_API_PREFIX}`
//
// Backwards compatibility (if older env vars present):
//   VITE_API_URL (full base including /api) or VITE_API_BASE_URL still respected.
//
// Guards:
//  - Normalizes double slashes
//  - Ensures trailing slash for axios base (DRF list endpoints convenience)
//  - Avoids producing /api/api when both prefix and legacy full path exist
// ================================================================

const rawExplicit = (import.meta.env.VITE_API_URL ?? '').trim(); // legacy full URL (maybe already contains /api)
const legacyBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
const baseRoot = (import.meta.env.VITE_API_BASE ?? '').trim();
const prefixRaw = (import.meta.env.VITE_API_PREFIX ?? '').trim();

// Decide strategy: if VITE_API_BASE provided, build with prefix; else fall back to explicit full.
let computedBase: string;
let inferredApiPrefix = false;
if (baseRoot) {
  const cleanedRoot = baseRoot.replace(/\/$/, '');
  const cleanedPrefix = prefixRaw
    ? ('/' + prefixRaw.replace(/^\//, '').replace(/\/$/, ''))
    : '/api'; // default prefix if not specified
  computedBase = cleanedRoot + cleanedPrefix;
} else if (rawExplicit) {
  computedBase = rawExplicit.replace(/\/$/, '');
  // If explicit URL was provided but appears to lack /api segment and no prefix var set, infer it.
  if (!/\/api(\/|$)/.test(computedBase) && !prefixRaw) {
    computedBase = computedBase + '/api';
    inferredApiPrefix = true;
  }
} else if (legacyBaseUrl) {
  computedBase = legacyBaseUrl.replace(/\/$/, '');
} else {
  // Final fallback (dev): same origin or explicit localhost
  computedBase = 'http://localhost:8000/api';
}

// Normalize duplicate /api/api or double slashes
computedBase = computedBase
  .replace(/\/+/g, '/')
  .replace(':/', '://')     // fix http:/ -> http://
  .replace(/(api)(\/api)+/g, 'api'); // collapse repeated api segments

// Ensure trailing slash for DRF convenience
const API_ROOT = /\/$/.test(computedBase) ? computedBase : computedBase + '/';

if (inferredApiPrefix && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.warn('[api] Se detectó VITE_API_URL sin /api; se añadió automáticamente. Configura VITE_API_BASE + VITE_API_PREFIX para control explícito.');
}

// Extract origin for export (without prefix) when possible
let API_BASE = API_ROOT.replace(/\/$/, '');
const apiMatch = API_BASE.match(/^(https?:\/\/[^\/]+)(\/.*)$/);
if (apiMatch) {
  API_BASE = apiMatch[1];
}

const api = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

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
  const token = localStorage.getItem('access_token') || localStorage.getItem('access');
  if (token) cfg.headers!['Authorization'] = `Bearer ${token}`;
  return cfg;
});

// Guard: reject HTML (likely SPA index.html) when JSON expected
api.interceptors.response.use(
  response => {
    const ct = response.headers['content-type'] || '';
    if (ct && !ct.includes('application/json')) {
      // Hard fail so callers can surface domain misconfiguration
      return Promise.reject(new Error('Respuesta no JSON: posible dominio incorrecto (recibido HTML).'));
    }
    return response;
  },
  error => Promise.reject(error)
);

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
  const refreshClient = axios.create({ baseURL: API_ROOT, headers: { Accept: 'application/json' } });
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

export const API_INFERRED_PREFIX = inferredApiPrefix;
export { API_ROOT, API_BASE };
export default api;
