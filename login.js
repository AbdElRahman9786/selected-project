/**
 * login.js – Login page logic (pure HTML/JS, no server)
 */
document.addEventListener('DOMContentLoaded', () => {
  const { showAlert, hideAlert, setFieldState, setLoading, loginUser, saveSession, getSession } = window.AuthLib;

  const form       = document.getElementById('login-form');
  const alertEl    = document.getElementById('login-alert');
  const submitBtn  = document.getElementById('login-submit-btn');
  const loaderEl   = document.getElementById('login-loader');
  const emailIn    = document.getElementById('login-email');
  const passwordIn = document.getElementById('login-password');
  const rememberCb = document.getElementById('remember-me');

  // Redirect if already logged in
  if (getSession()) {
    window.location.href = 'index.html';
    return;
  }

  /* Live validation on blur */
  emailIn.addEventListener('blur', () => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailIn.value.trim());
    setFieldState(emailIn, document.getElementById('err-login-email'), ok ? '' : 'Enter a valid email address.');
  });

  passwordIn.addEventListener('blur', () => {
    setFieldState(passwordIn, document.getElementById('err-login-password'), passwordIn.value ? '' : 'Password is required.');
  });

  /* Form submit */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert(alertEl);

    const email    = emailIn.value.trim();
    const password = passwordIn.value;
    let valid = true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldState(emailIn, document.getElementById('err-login-email'), 'Enter a valid email address.');
      valid = false;
    }
    if (!password) {
      setFieldState(passwordIn, document.getElementById('err-login-password'), 'Password is required.');
      valid = false;
    }
    if (!valid) return;

    // Simulate brief loading for UX
    setLoading(submitBtn, loaderEl, true);
    setTimeout(() => {
      const result = loginUser({ email, password });
      setLoading(submitBtn, loaderEl, false);

      if (result.success) {
        saveSession(result.user, rememberCb?.checked);
        showAlert(alertEl, `✓ ${result.message} Redirecting…`, 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1100);
      } else {
        showAlert(alertEl, result.message, 'error');
        emailIn.classList.add('invalid');
        passwordIn.classList.add('invalid');
      }
    }, 500);
  });

  /* Social auth placeholders */
  document.getElementById('google-login')?.addEventListener('click', () => {
    showAlert(alertEl, 'Google sign-in is not available in offline mode.', 'error');
  });
  document.getElementById('facebook-login')?.addEventListener('click', () => {
    showAlert(alertEl, 'Facebook sign-in is not available in offline mode.', 'error');
  });

  /* Forgot password */
  document.getElementById('forgot-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showAlert(alertEl, 'Password reset: contact support@aboss.com', 'success');
  });
});
