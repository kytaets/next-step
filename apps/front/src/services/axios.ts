import axios from 'axios';
import { handleResponseError } from './authInterceptor';

const api = axios.create({
  baseURL: 'http://localhost:8020/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use((response) => response, handleResponseError);

export default api;
