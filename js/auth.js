// ============================================================
// auth.js - Authentication Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Already logged in → go to shop
  if (getCurrentUser()) {
    window.location.href = 'shop.html';
    return;
  }

  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  loginTab.addEventListener('click', () => switchTab('login'));
  registerTab.addEventListener('click', () => switchTab('register'));

  function switchTab(tab) {
    if (tab === 'login') {
      loginTab.classList.add('border-indigo-600', 'text-indigo-600');
      loginTab.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
      registerTab.classList.remove('border-indigo-600', 'text-indigo-600');
      registerTab.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
    } else {
      registerTab.classList.add('border-indigo-600', 'text-indigo-600');
      registerTab.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
      loginTab.classList.remove('border-indigo-600', 'text-indigo-600');
      loginTab.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    }
  }

  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
});

// ------------------------------------------------------------
// Login
// ------------------------------------------------------------
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    showToast('Invalid email or password', 'error');
    return;
  }

  localStorage.setItem('currentUser', JSON.stringify({ id: user.id, name: user.name, email: user.email }));
  showToast(`Welcome back, ${user.name}!`, 'success');
  setTimeout(() => { window.location.href = 'shop.html'; }, 800);
}

// ------------------------------------------------------------
// Register
// ------------------------------------------------------------
function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;

  if (!name || !email || !password || !confirm) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  if (name.length < 2) {
    showToast('Name must be at least 2 characters', 'error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }
  if (password !== confirm) {
    showToast('Passwords do not match', 'error');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find((u) => u.email === email)) {
    showToast('Email already registered. Please login.', 'error');
    return;
  }

  users.push({ id: Date.now(), name, email, password, createdAt: new Date().toISOString() });
  localStorage.setItem('users', JSON.stringify(users));
  showToast('Account created! Please login.', 'success');

  setTimeout(() => {
    document.getElementById('login-tab').click();
    document.getElementById('login-email').value = email;
  }, 1000);
}

// ------------------------------------------------------------
// Toggle Password Visibility
// ------------------------------------------------------------
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.innerHTML = isHidden
    ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
           d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
           d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
           d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
       </svg>`;
}
