// ============================================================
// cart.js - Cart Page Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  renderCart();

  document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
    if (confirm('Clear all items from cart?')) {
      saveCart([]);
      showToast('Cart cleared', 'info');
      renderCart();
    }
  });
});

// ------------------------------------------------------------
// Render Cart
// ------------------------------------------------------------
function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-items');
  const emptyState = document.getElementById('empty-cart');
  const cartContent = document.getElementById('cart-content');

  if (!container) return;

  if (cart.length === 0) {
    emptyState?.classList.remove('hidden');
    cartContent?.classList.add('hidden');
    return;
  }

  emptyState?.classList.add('hidden');
  cartContent?.classList.remove('hidden');

  container.innerHTML = cart.map(createCartItem).join('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 15000;
  const total = subtotal + shipping;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const el = (id) => document.getElementById(id);
  if (el('subtotal-price')) el('subtotal-price').textContent = formatRupiah(subtotal);
  if (el('shipping-price')) el('shipping-price').textContent = formatRupiah(shipping);
  if (el('cart-total')) el('cart-total').textContent = formatRupiah(total);
  if (el('item-count')) el('item-count').textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

  bindCartEvents();
}

function createCartItem(item) {
  return `
    <div class="cart-item flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm
                border border-gray-100 dark:border-gray-700" data-id="${item.id}">
      <a href="product.html?id=${item.id}" class="flex-shrink-0">
        <img src="${item.image}" alt="${item.name}"
          class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg" />
      </a>
      <div class="flex-1 min-w-0">
        <a href="product.html?id=${item.id}">
          <h3 class="font-semibold text-gray-800 dark:text-white text-sm sm:text-base
                     hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors
                     overflow-hidden" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
            ${item.name}
          </h3>
        </a>
        <p class="text-indigo-600 dark:text-indigo-400 font-bold mt-1">${formatRupiah(item.price)}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Subtotal: <span class="font-semibold text-gray-700 dark:text-gray-300">
            ${formatRupiah(item.price * item.quantity)}
          </span>
        </p>
        <div class="flex items-center justify-between mt-3">
          <div class="flex items-center gap-2">
            <button class="qty-btn decrease w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700
                           hover:bg-indigo-100 dark:hover:bg-indigo-900 text-gray-700 dark:text-gray-200
                           font-bold transition-colors flex items-center justify-center"
              data-id="${item.id}">−</button>
            <span class="qty-display w-8 text-center font-semibold text-gray-800 dark:text-white">
              ${item.quantity}
            </span>
            <button class="qty-btn increase w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700
                           hover:bg-indigo-100 dark:hover:bg-indigo-900 text-gray-700 dark:text-gray-200
                           font-bold transition-colors flex items-center justify-center"
              data-id="${item.id}" data-stock="${item.stock}">+</button>
          </div>
          <button class="remove-btn text-red-500 hover:text-red-700 transition-colors
                         flex items-center gap-1 text-sm" data-id="${item.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  `;
}

// ------------------------------------------------------------
// Bind Events
// ------------------------------------------------------------
function bindCartEvents() {
  document.querySelectorAll('.qty-btn.decrease').forEach((btn) => {
    btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.id), -1));
  });
  document.querySelectorAll('.qty-btn.increase').forEach((btn) => {
    btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.id), 1, parseInt(btn.dataset.stock)));
  });
  document.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
  });
}

function updateQuantity(productId, delta, stock = Infinity) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  const newQty = item.quantity + delta;
  if (newQty < 1) { removeFromCart(productId); return; }
  if (newQty > stock) { showToast(`Only ${stock} items in stock`, 'warning'); return; }
  item.quantity = newQty;
  saveCart(cart);
  renderCart();
}

function removeFromCart(productId) {
  let cart = getCart();
  const item = cart.find((i) => i.id === productId);
  cart = cart.filter((i) => i.id !== productId);
  saveCart(cart);
  if (item) showToast(`${item.name} removed from cart`, 'info');
  renderCart();
}
