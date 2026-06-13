/**
 * Axios API Instance for SIMWT Mobile
 * Configured with base URL, API token, and auth interceptors
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../../constants/Api';
import { storage } from '../utils/storage';

const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-SIMMWT-KEY': API_CONFIG.API_TOKEN,
  },
});

// Request interceptor — attach Bearer token and Device ID
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Append Device ID for backend device authorization
    const deviceId = await storage.getDeviceId();
    if (deviceId) {
      config.headers['X-DEVICE-ID'] = deviceId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — handle 401 (unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage
      await storage.clearAll();
    }
    return Promise.reject(error);
  }
);

export default api;
