export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ADMIN_PANEL_URL = (() => {
  if (API_BASE_URL.endsWith('/api')) {
    return API_BASE_URL.replace(/\/api$/, '') + '/admin';
  }
  return API_BASE_URL + '/admin';
})();
