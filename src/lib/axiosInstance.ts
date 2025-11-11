import axios, { type AxiosInstance } from "axios";

// ✅ Création d'une instance Axios avec configuration de base
const Axios: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api", // URL backend
  timeout: 10000, // délai maximum (10s)
});

// ✅ Intercepteur pour ajouter le token d'authentification si présent
Axios.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("auth.token") ||
      sessionStorage.getItem("auth.token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Intercepteur de réponse (gestion d’erreur globale)
Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Session expirée ou non autorisée");
      // Optionnel : redirection vers login
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default Axios;
