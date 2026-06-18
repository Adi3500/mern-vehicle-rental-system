import axios from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from './storage';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const shouldRefresh =
      status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/login') &&
      !originalRequest?.url?.includes('/auth/register') &&
      !originalRequest?.url?.includes('/auth/refresh') &&
      !originalRequest?.url?.includes('/auth/logout') &&
      getAccessToken();

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await api.post('/auth/refresh');
      const nextToken = refreshResponse?.data?.data?.accessToken;
      const nextUser = refreshResponse?.data?.data?.user;

      setAccessToken(nextToken);

      if (nextUser) {
        window.dispatchEvent(
          new CustomEvent('auth:session-refreshed', {
            detail: { accessToken: nextToken, user: nextUser },
          })
        );
      }

      originalRequest.headers.Authorization = `Bearer ${nextToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      window.dispatchEvent(new CustomEvent('auth:expired'));
      return Promise.reject(refreshError);
    }
  }
);

export default api;
