import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // attach token if needed
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error),
);

export default api;
