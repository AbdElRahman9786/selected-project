/**
 * register.js – Registration page logic with Auto-Login to Home
 */
document.addEventListener('DOMContentLoaded', () => {
  const { showAlert, hideAlert, setFieldState, setLoading, registerUser, saveSession, getSession } = window.AuthLib;

  const form       = document.getElementById('register-form');
  const alertEl    = document.getElementById('register-alert');
  const submitBtn  = document.getElementById('register-submit-btn');
  const loaderEl   = document.getElementById('register-loader');
  const firstIn    = document.getElementById('reg-firstname');
  const lastIn     = document.getElementById('reg-lastname');
  const emailIn    = document.getElementById('reg-email');
  const phoneIn    = document.getElementById('reg-phone');
  const passwordIn = document.getElementById('reg-password');
  const confirmIn  = document.getElementById('reg-confirm');
  const termsCb    = document.getElementById('agree-terms');

  // Redirect if already logged in
  if (getSession()) {
    window.location.href = 'index.html';
    return;
  }

  /* Live blur validators */
  firstIn.addEventListener('blur', () =>
    setFieldState(firstIn, document.getElementById('err-firstname'), firstIn.value.trim() ? '' : 'First name is required.'));

  lastIn.addEventListener('blur', () =>
    setFieldState(lastIn, document.getElementById('err-lastname'), lastIn.value.trim() ? '' : 'Last name is required.'));

  emailIn.addEventListener('blur', () => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailIn.value.trim());
    setFieldState(emailIn, document.getElementById('err-reg-email'), ok ? '' : 'Enter a valid email address.');
  });

  passwordIn.addEventListener('blur', () => {
    setFieldState(passwordIn, document.getElementById('err-reg-password'),
      passwordIn.value.length >= 8 ? '' : 'Password must be at least 8 characters.');
    if (confirmIn.value) validateConfirm();
  });

  function validateConfirm() {
    const match = confirmIn.value === passwordIn.value;
    setFieldState(confirmIn, document.getElementById('err-reg-confirm'), match ? '' : 'Passwords do not match.');
    return match;
  }
  confirmIn.addEventListener('blur', validateConfirm);
  confirmIn.addEventListener('input', () => {
    if (confirmIn.classList.contains('invalid')) validateConfirm();
  });

  termsCb.addEventListener('change', () => {
    if (termsCb.checked) document.getElementById('err-terms').textContent = '';
  });

  /* Form submit */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert(alertEl);

    const firstname = firstIn.value.trim();
    const lastname  = lastIn.value.trim();
    const email     = emailIn.value.trim();
    const phone     = phoneIn.value.trim();
    const password  = passwordIn.value;
    const confirm   = confirmIn.value;

    let valid = true;

    if (!firstname) { setFieldState(firstIn, document.getElementById('err-firstname'), 'First name is required.'); valid = false; }
    if (!lastname)  { setFieldState(lastIn,  document.getElementById('err-lastname'),  'Last name is required.'); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldState(emailIn, document.getElementById('err-reg-email'), 'Enter a valid email.'); valid = false;
    }
    if (password.length < 8) {
      setFieldState(passwordIn, document.getElementById('err-reg-password'), 'Password must be at least 8 characters.'); valid = false;
    }
    if (password !== confirm) {
      setFieldState(confirmIn, document.getElementById('err-reg-confirm'), 'Passwords do not match.'); valid = false;
    }
    if (!termsCb.checked) {
      document.getElementById('err-terms').textContent = 'You must agree to the terms.'; valid = false;
    }

    if (!valid) return;

    setLoading(submitBtn, loaderEl, true);

    const requestData = {
      first_name: firstname,
      last_name: lastname,
      email: email,
      phone: phone || null,
      password: password,
      role: 'customer' 
    };

    
    fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    .then(response => response.json().then(data => ({ status: response.status, data })))
    .then(({ status, data }) => {
      if (status === 201) {
        showAlert(alertEl, `✓ Registration successful! Logging in automatically…`, 'success');

        return fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email, password: password })
        })
        .then(loginRes => loginRes.json().then(loginData => ({ loginStatus: loginRes.status, loginData })));
      } else {
      
        setLoading(submitBtn, loaderEl, false);
        showAlert(alertEl, data.error || 'Registration failed.', 'error');
        return null;
      }
    })
    .then(resResult => {
      if (!resResult) return; 

      const { loginStatus, loginData } = resResult;
      setLoading(submitBtn, loaderEl, false);

      if (loginStatus === 200 && loginData.token) {
        
        localStorage.setItem('token', loginData.token);

        
        const userData = {
          id: (loginData.user && loginData.user.id) || 3,
          firstname: firstname,
          first_name: firstname,
          lastname: lastname,
          last_name: lastname,
          email: email,
          role: 'customer'
        };

        
        localStorage.setItem('aboss_session', JSON.stringify(userData));
        sessionStorage.setItem('aboss_session', JSON.stringify(userData));
        
        
        const userCart = localStorage.getItem('aboss_cart_' + userData.id) || '[]';
        localStorage.setItem('aboss_cart', userCart);

       
        setTimeout(() => { 
          window.location.href = 'index.html'; 
        }, 1000);
      } else {
        window.location.href = 'login.html';
      }
    })
    .catch(error => {
      setLoading(submitBtn, loaderEl, false);
      console.error('Error during registration/login:', error);
      showAlert(alertEl, '⚠️ Unable to connect to the server. Please ensure Docker containers are running.', 'error');
    });
  });
});
