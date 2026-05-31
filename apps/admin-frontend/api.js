/**
 * api.js – Centralized admin API client
 */
(function (global) {
  'use strict';

  const API_BASE =
    global.ADMIN_API_BASE ||
    `${window.location.protocol}//${window.location.hostname}:5000`;

  function getToken() {
    return localStorage.getItem('aboss_admin_token');
  }

  function parseErrorBody(data, status) {
    if (data && data.error) return data.error;
    if (data && data.message) return data.message;
    return `Request failed (${status})`;
  }

  async function request(path, options = {}) {
    const headers = {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    };

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body !== undefined) {
      config.body =
        typeof options.body === 'string'
          ? options.body
          : JSON.stringify(options.body);
    }

    let response;
    try {
      response = await fetch(`${API_BASE}${path}`, config);
    } catch (err) {
      const networkError = new Error(
        'Unable to reach the server. Is the backend running on port 5000?'
      );
      networkError.isNetworkError = true;
      networkError.cause = err;
      throw networkError;
    }

    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    }

    if (response.status === 401 || response.status === 403) {
      const authError = new Error(parseErrorBody(data, response.status));
      authError.status = response.status;
      authError.isAuthError = true;
      throw authError;
    }

    if (!response.ok) {
      const err = new Error(parseErrorBody(data, response.status));
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  const AdminAPI = {
    baseUrl: API_BASE,

    login(email, password) {
      return request('/api/admin/login', {
        method: 'POST',
        body: { email, password },
      });
    },

    getDashboard() {
      return request('/api/admin/dashboard');
    },

    getProducts() {
      return request('/api/admin/products');
    },

    getProduct(id) {
      return request(`/api/admin/products/${id}`);
    },

    createProduct(payload) {
      return request('/api/admin/products', {
        method: 'POST',
        body: payload,
      });
    },

    updateProduct(id, payload) {
      return request(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: payload,
      });
    },

    deleteProduct(id) {
      return request(`/api/admin/products/${id}`, { method: 'DELETE' });
    },

    getUsers() {
      return request('/api/admin/users');
    },

    updateUser(id, payload) {
      return request(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: payload,
      });
    },

    deleteUser(id) {
      return request(`/api/admin/users/${id}`, { method: 'DELETE' });
    },

    getOrders() {
      return request('/api/admin/orders');
    },

    getOrder(id) {
      return request(`/api/admin/orders/${id}`);
    },

    updateOrder(id, payload) {
      return request(`/api/admin/orders/${id}`, {
        method: 'PUT',
        body: payload,
      });
    },
  };

  global.AdminAPI = AdminAPI;
})(window);
