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

    
    setLoading(submitBtn, loaderEl, true);

    fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => response.json().then(data => ({ status: response.status, data })))
    .then(({ status, data }) => {
      setLoading(submitBtn, loaderEl, false);

      if (status === 200) {
  localStorage.setItem('aboss_token', data.token);

  let tokenPayload = {};
  try {
    tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
  } catch(e) {}

  const sessionUser = {
    id:         tokenPayload.id         || tokenPayload.sub  || '',
    firstname:  tokenPayload.first_name || tokenPayload.firstname || '',
    first_name: tokenPayload.first_name || tokenPayload.firstname || '',
    lastname:   tokenPayload.last_name  || tokenPayload.lastname  || '',
    last_name:  tokenPayload.last_name  || tokenPayload.lastname  || '',
    email:      tokenPayload.email      || '',
    role:       tokenPayload.role       || 'customer',
  };

  localStorage.setItem('aboss_session', JSON.stringify(sessionUser));
  sessionStorage.setItem('aboss_session', JSON.stringify(sessionUser));
  localStorage.setItem('token', data.token);

        const userCart = localStorage.getItem('aboss_cart_' + data.user.id) || '[]';
        localStorage.setItem('aboss_cart', userCart);

        showAlert(alertEl, `✓ ${data.message} Redirecting…`, 'success');

        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = 'http://localhost:8081'; 
          } else {
            window.location.href = 'index.html';
          }
        }, 1100);
      } else {
        showAlert(alertEl, data.error || 'Invalid email or password.', 'error');
        emailIn.classList.add('invalid');
        passwordIn.classList.add('invalid');
      }
    })
    .catch(error => {
      setLoading(submitBtn, loaderEl, false);
      console.error('Error during login:', error);
      showAlert(alertEl, ' Unable to connect to the server. Please ensure Docker containers are running.', 'error');
    });
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
