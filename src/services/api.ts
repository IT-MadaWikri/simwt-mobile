/**
 * Axios API Instance for SIMWT Mobile
 * Configured with base URL, API token, and auth interceptors
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../../constants/Api';
import { storage } from '../utils/storage';
import { laporkanMasalahJaringan } from '../utils/masalahJaringan';

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

// Response interceptor — 401 dan kegagalan jaringan
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage
      await storage.clearAll();
    }

    // Kegagalan jaringan & timeout tidak punya `response`, dan pesan bawaan
    // axios-nya ("Network Error" / "timeout of 15000ms exceeded") tidak
    // memberi tahu apa pun kepada pengguna di lapangan. Tanpa ini, layar
    // hanya berputar sampai timeout lalu gagal tanpa penjelasan — persis
    // gejala "loading stuck".
    if (!error.response) {
      const timeout = error.code === 'ECONNABORTED';
      error.message = timeout
        ? 'Server terlalu lama merespons. Periksa koneksi Anda, lalu coba lagi.'
        : `Tidak dapat terhubung ke server (${API_CONFIG.BASE_URL}). ` +
          'Pastikan Anda berada di jaringan yang benar.';
      error.isNetworkError = true;
      // Beri tahu UI (alert global); permintaan yang sengaja dibatalkan bukan masalah jaringan.
      if (!axios.isCancel(error)) laporkanMasalahJaringan(timeout ? 'timeout' : 'offline');
    }

    return Promise.reject(error);
  }
);

export default api;
