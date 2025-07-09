import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token');
  if (token) cfg.headers!['Authorization'] = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    const status = err.response?.status;

    if (
      status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refresh_token') &&
      !originalRequest.url?.includes('/login/') // No intentar refresh en login
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        localStorage.clear();
        // Solo redirigir a login admin si estamos en rutas admin
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(err);
      }

      try {
        const { data } = await api.post('/users/token/refresh/', { refresh: refreshToken });

        if (data?.access) {
          localStorage.setItem('access_token', data.access);
          originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
          return api(originalRequest);
        } else {
          throw new Error('No se recibió nuevo access token');
        }

      } catch (refreshError) {
        localStorage.clear();
        // Solo redirigir a login admin si estamos en rutas admin
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
    const response = await api.post('/users/login/', { email, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/users/me/');
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
    await api.delete(`/properties/${id}/`);
    alert('Propiedad eliminada');
  } catch (error) {
    alert('Error al eliminar la propiedad');
    console.error(error);
  }
};

export default api;
