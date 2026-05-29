/**
 * auth.js – Shared auth utilities (pure browser, no server)
 * Data is stored in localStorage as "aboss_users" (JSON array).
 * Users can export the data as a .json file at any time.
 */

/* ─────────────────────────────────────────────────────────
   Toggle password visibility
───────────────────────────────────────────────────────── */
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const wrap  = btn.closest('.input-wrap');
    const input = wrap.querySelector('input');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.querySelector('.eye-icon').style.opacity = isHidden ? '0.4' : '1';
  });
});

/* ─────────────────────────────────────────────────────────
   Alert box helpers
───────────────────────────────────────────────────────── */
function showAlert(alertEl, message, type = 'error') {
  alertEl.textContent = message;
  alertEl.className = 'auth-alert ' + type;
  alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function hideAlert(alertEl) {
  alertEl.className = 'auth-alert';
  alertEl.textContent = '';
}

/* ─────────────────────────────────────────────────────────
   Field state helpers
───────────────────────────────────────────────────────── */
function setFieldState(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.remove('valid');
    inputEl.classList.add('invalid');
    if (errorEl) errorEl.textContent = message;
  } else {
    inputEl.classList.remove('invalid');
    inputEl.classList.add('valid');
    if (errorEl) errorEl.textContent = '';
  }
}

/* ─────────────────────────────────────────────────────────
   Button loading state
───────────────────────────────────────────────────────── */
function setLoading(btn, loaderEl, isLoading) {
  btn.disabled = isLoading;
  loaderEl.classList.toggle('active', isLoading);
  btn.querySelector('.btn-text').style.opacity = isLoading ? '0.6' : '1';
}

/* ─────────────────────────────────────────────────────────
   Password strength meter
───────────────────────────────────────────────────────── */
const regPwInput    = document.getElementById('reg-password');
const strengthFill  = document.getElementById('strength-fill');
const strengthLabel = document.getElementById('strength-label');

if (regPwInput && strengthFill && strengthLabel) {
  regPwInput.addEventListener('input', () => {
    const score = getPasswordScore(regPwInput.value);
    const levels = [
      { label: '',       color: 'transparent', width: '0%'   },
      { label: 'Weak',   color: '#e53935',      width: '25%'  },
      { label: 'Fair',   color: '#ff9800',      width: '50%'  },
      { label: 'Good',   color: '#fdd835',      width: '75%'  },
      { label: 'Strong', color: '#7bc040',      width: '100%' },
    ];
    const lv = levels[score];
    strengthFill.style.width      = lv.width;
    strengthFill.style.background = lv.color;
    strengthLabel.textContent     = lv.label;
    strengthLabel.style.color     = lv.color;
  });
}

function getPasswordScore(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

/* ─────────────────────────────────────────────────────────
   Simple password hash (browser-only, not cryptographic)
───────────────────────────────────────────────────────── */
function hashPassword(pw) {
  let hash = 5381;
  for (let i = 0; i < pw.length; i++) {
    hash = ((hash << 5) + hash) ^ pw.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  return 'h_' + hash.toString(16) + '_aboss';
}

/* ─────────────────────────────────────────────────────────
   localStorage DB helpers
───────────────────────────────────────────────────────── */
function readUsers() {
  try {
    return JSON.parse(localStorage.getItem('aboss_users') || '[]');
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem('aboss_users', JSON.stringify(users, null, 2));
}

function generateId() {
  return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

/* ─────────────────────────────────────────────────────────
   Register logic
───────────────────────────────────────────────────────── */
function registerUser({ firstname, lastname, email, phone, password }) {
  // Validate
  if (!firstname || !lastname || !email || !password)
    return { success: false, message: 'All required fields must be filled.' };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { success: false, message: 'Invalid email address.' };

  if (password.length < 8)
    return { success: false, message: 'Password must be at least 8 characters.' };

  const users = readUsers();

  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return { success: false, message: 'An account with this email already exists.' };

  const newUser = {
    id:        generateId(),
    firstname: firstname.trim(),
    lastname:  lastname.trim(),
    email:     email.toLowerCase().trim(),
    phone:     phone ? phone.trim() : '',
    password:  hashPassword(password),
    createdAt: new Date().toISOString(),
    role:      'customer'
  };

  users.push(newUser);
  writeUsers(users);

  const { password: _, ...safeUser } = newUser;
  return { success: true, message: 'Account created successfully!', user: safeUser };
}

/* ─────────────────────────────────────────────────────────
   Login logic
───────────────────────────────────────────────────────── */
function loginUser({ email, password }) {
  if (!email || !password)
    return { success: false, message: 'Email and password are required.' };

  const users = readUsers();
  const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== hashPassword(password))
    return { success: false, message: 'Invalid email or password.' };

  // Update last login
  user.lastLogin = new Date().toISOString();
  writeUsers(users);

  const { password: _, ...safeUser } = user;
  return { success: true, message: `Welcome back, ${user.firstname}!`, user: safeUser };
}

/* ─────────────────────────────────────────────────────────
   Session helpers (sessionStorage = tab-only, localStorage = remember me)
───────────────────────────────────────────────────────── */
function saveSession(user, remember) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('aboss_session', JSON.stringify(user));
}

function getSession() {
  try {
    return JSON.parse(
      localStorage.getItem('aboss_session') ||
      sessionStorage.getItem('aboss_session') ||
      'null'
    );
  } catch { return null; }
}

function clearSession() {
  localStorage.removeItem('aboss_session');
  sessionStorage.removeItem('aboss_session');
}

/* ─────────────────────────────────────────────────────────
   Export users as JSON file (download)
───────────────────────────────────────────────────────── */
function exportUsersJSON() {
  const users = readUsers().map(({ password: _, ...u }) => u); // strip passwords
  const blob  = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = 'aboss_users.json';
  a.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────────────────
   Expose globals for page scripts
───────────────────────────────────────────────────────── */
window.AuthLib = {
  showAlert, hideAlert, setFieldState, setLoading,
  registerUser, loginUser,
  saveSession, getSession, clearSession,
  exportUsersJSON
};
