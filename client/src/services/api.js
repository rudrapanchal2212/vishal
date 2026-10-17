api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    console.error(
      'API error:',
      error.config?.url,
      status,
      error.response?.data || error.message
    );

    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('vishal_token');
      localStorage.removeItem('vishwa_token');
      delete api.defaults.headers.common.Authorization;

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
