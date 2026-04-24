// src/api/axios.js
// Konfigurasi instance Axios terpusat.
// - Mengatur base URL ke backend API.
// - Request interceptor: otomatis menyisipkan JWT token dari localStorage
//   ke header 'Authorization' di setiap request yang keluar.
// - Response interceptor: menangani error 401 (token expired/invalid)
//   dengan redirect otomatis ke halaman login.

import axios from "axios";
import router from "../router/index.js";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 detik timeout
});

// ─── Request Interceptor 
// Setiap request keluar akan melalui fungsi ini terlebih dahulu
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("perpus_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor 
// Menangani setiap response yang masuk, terutama error
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token tidak valid atau kedaluwarsa — paksa logout
      localStorage.removeItem("perpus_token");
      localStorage.removeItem("perpus_user");
      router.push({ name: "Login" });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
