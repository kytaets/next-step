import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8020/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      document.cookie = 'company-id=; Max-Age=0; path=/;';

      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
