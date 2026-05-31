/**
 * admin-auth.js – Admin session, route protection, shared UI helpers
 */
(function (global) {
  'use strict';

  const AdminUI = {
    showAlert(el, message, type) {
      if (!el) return;
      el.textContent = message;
      el.className = `auth-alert ${type}`;
    },

    setLoading(btn, loaderEl, isLoading) {
      if (btn) btn.disabled = isLoading;
      if (loaderEl) loaderEl.classList.toggle('active', isLoading);
      const text = btn?.querySelector('.btn-text');
      if (text) text.style.opacity = isLoading ? '0.6' : '1';
    },

    showToast(message, type = 'success') {
      let toast = document.getElementById('admin-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.className = 'admin-toast';
        toast.innerHTML = '<span id="admin-toast-msg"></span>';
        document.body.appendChild(toast);
      }
      const msg = document.getElementById('admin-toast-msg');
      if (msg) msg.textContent = message;
      toast.className = `admin-toast show ${type}`;
      clearTimeout(AdminUI._toastTimer);
      AdminUI._toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 3200);
    },

    formatMoney(value) {
      const num = Number(value) || 0;
      return `$${num.toFixed(2)}`;
    },

    formatDate(value) {
      if (!value) return '—';
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    escapeHtml(str) {
      return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    openModal(id) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
      }
    },

    closeModal(id) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }
    },

    bindModalClose() {
      document.querySelectorAll('[data-modal-close]').forEach((el) => {
        el.addEventListener('click', () => {
          const modal = el.closest('.admin-modal');
          if (modal) {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
          }
        });
      });
      document.querySelectorAll('.admin-modal').forEach((modal) => {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
          }
        });
      });
    },
  };

  global.AdminUI = AdminUI;

  const TOKEN_KEY = 'aboss_admin_token';
  const USER_KEY = 'aboss_admin_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getAdminUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function isLoggedIn() {
    return Boolean(getToken());
  }

  function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'login.html';
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  function redirectIfLoggedIn() {
    if (isLoggedIn()) {
      window.location.href = 'index.html';
      return true;
    }
    return false;
  }

  function handleApiAuthError(err) {
    if (err && err.isAuthError) {
      logout();
      return true;
    }
    return false;
  }

  function bindLogoutButtons() {
    document.querySelectorAll('[data-logout]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    });
  }

  function updateAdminEmailDisplay() {
    const el = document.getElementById('admin-email');
    const user = getAdminUser();
    if (el && user) {
      el.textContent = user.email || 'Admin';
    }
  }

  function setActiveNav() {
    const page = document.body.dataset.page;
    if (!page) return;
    document.querySelectorAll('.admin-nav-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.page === page);
    });
  }

  function initLoginPage() {
    if (redirectIfLoggedIn()) return;

    const form = document.getElementById('admin-login-form');
    const alertEl = document.getElementById('login-alert');
    const submitBtn = document.getElementById('login-submit-btn');
    const loaderEl = document.getElementById('login-loader');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (alertEl) {
        alertEl.className = 'auth-alert';
        alertEl.textContent = '';
      }

      const email = document.getElementById('login-email')?.value.trim();
      const password = document.getElementById('login-password')?.value;

      if (!email || !password) {
        AdminUI.showAlert(alertEl, 'Email and password are required.', 'error');
        return;
      }

      AdminUI.setLoading(submitBtn, loaderEl, true);

      try {
        const data = await AdminAPI.login(email, password);
        saveSession(data.token, data.user);
        AdminUI.showAlert(alertEl, 'Signed in successfully. Redirecting…', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 600);
      } catch (err) {
        AdminUI.setLoading(submitBtn, loaderEl, false);
        AdminUI.showAlert(alertEl, err.message || 'Login failed.', 'error');
      }
    });

    document.querySelectorAll('.toggle-password').forEach((btn) => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.input-wrap');
        const input = wrap?.querySelector('input');
        if (!input) return;
        const hidden = input.type === 'password';
        input.type = hidden ? 'text' : 'password';
        const icon = btn.querySelector('.eye-icon');
        if (icon) icon.style.opacity = hidden ? '0.4' : '1';
      });
    });
  }

  function initAdminShell() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
  }

  function initProtectedPage() {
    if (!requireAuth()) return false;
    bindLogoutButtons();
    updateAdminEmailDisplay();
    setActiveNav();
    initAdminShell();
    return true;
  }

  const AdminAuth = {
    getToken,
    getAdminUser,
    isLoggedIn,
    saveSession,
    logout,
    requireAuth,
    redirectIfLoggedIn,
    handleApiAuthError,
    initLoginPage,
    initProtectedPage,
  };

  global.AdminAuth = AdminAuth;

  /* Fast redirect before page paints (protected pages set data-page on body) */
  if (document.body?.dataset?.page && !isLoggedIn()) {
    window.location.replace('login.html');
  }
})(window);
