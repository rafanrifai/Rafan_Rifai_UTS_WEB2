// ============================================================
// app.js - Shared Utilities
// ============================================================

// Apply dark mode before page renders (prevent flash)
(function () {
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
  }
})();

// ------------------------------------------------------------
// Toast Notification System
// ------------------------------------------------------------
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-indigo-500',
  };
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

  const toast = document.createElement('div');
  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl text-white shadow-lg text-sm
    font-medium transform translate-x-full transition-transform duration-300 ease-out pointer-events-auto
    ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <span class="text-base font-bold">${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.remove('translate-x-full'));
  });

  setTimeout(() => {
    toast.classList.add('translate-x-full');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}

// ------------------------------------------------------------
// Dark Mode
// ------------------------------------------------------------
function initDarkMode() {
  const dark = localStorage.getItem('darkMode') === 'true';
  document.documentElement.classList.toggle('dark', dark);
  updateDarkModeButtons();
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
  updateDarkModeButtons();
}

function updateDarkModeButtons() {
  const isDark = document.documentElement.classList.contains('dark');
  document.querySelectorAll('.dark-mode-btn').forEach((btn) => {
    btn.innerHTML = isDark
      ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
             d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
         </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
             d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
         </svg>`;
  });
}

// ------------------------------------------------------------
// Currency Formatter
// ------------------------------------------------------------
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// ------------------------------------------------------------
// Auth Helpers
// ------------------------------------------------------------
function getCurrentUser() {
  const u = localStorage.getItem('currentUser');
  return u ? JSON.parse(u) : null;
}

function requireAuth() {
  if (!getCurrentUser()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// ------------------------------------------------------------
// Cart Helpers
// ------------------------------------------------------------
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    showToast('Quantity updated in cart', 'success');
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity,
    });
    showToast(`${product.name} added to cart!`, 'success');
  }
  saveCart(cart);
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-badge').forEach((badge) => {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  });
}

// ------------------------------------------------------------
// Wishlist Helpers
// ------------------------------------------------------------
function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist') || '[]');
}

function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

function toggleWishlist(productId) {
  const wishlist = getWishlist();
  const idx = wishlist.indexOf(productId);
  if (idx === -1) {
    wishlist.push(productId);
    showToast('Added to wishlist!', 'success');
  } else {
    wishlist.splice(idx, 1);
    showToast('Removed from wishlist', 'info');
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  return idx === -1;
}

// ------------------------------------------------------------
// Star Rating Renderer
// ------------------------------------------------------------
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  let stars = '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  return `<span class="text-yellow-400 text-sm">${stars}</span>
          <span class="text-gray-500 dark:text-gray-400 text-xs ml-1">(${rating})</span>`;
}

// ------------------------------------------------------------
// Navbar User Info
// ------------------------------------------------------------
function renderNavUser() {
  const user = getCurrentUser();
  const navUser = document.getElementById('nav-user');
  if (!navUser || !user) return;
  navUser.innerHTML = `
    <span class="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
      Hi, ${user.name.split(' ')[0]}
    </span>
    <button onclick="logout()"
      class="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors">
      Logout
    </button>
  `;
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  updateCartBadge();
  renderNavUser();
  document.querySelectorAll('.dark-mode-btn').forEach((btn) => {
    btn.addEventListener('click', toggleDarkMode);
  });
});
