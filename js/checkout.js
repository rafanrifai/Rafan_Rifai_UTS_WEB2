// ============================================================
// checkout.js - Checkout Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  renderOrderSummary(cart);
  document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
});

// ------------------------------------------------------------
// Render Order Summary
// ------------------------------------------------------------
function renderOrderSummary(cart) {
  const container = document.getElementById('order-items');
  if (!container) return;

  container.innerHTML = cart.map((item) => `
    <div class="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <img src="${item.image}" alt="${item.name}"
        class="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-800 dark:text-white overflow-hidden"
           style="display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;">${item.name}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Qty: ${item.quantity}</p>
      </div>
      <span class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
        ${formatRupiah(item.price * item.quantity)}
      </span>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 15000;
  const total = subtotal + shipping;

  const el = (id) => document.getElementById(id);
  if (el('summary-subtotal')) el('summary-subtotal').textContent = formatRupiah(subtotal);
  if (el('summary-shipping')) el('summary-shipping').textContent = formatRupiah(shipping);
  if (el('summary-total')) el('summary-total').textContent = formatRupiah(total);
}

// ------------------------------------------------------------
// Handle Checkout
// ------------------------------------------------------------
function handleCheckout(e) {
  e.preventDefault();

  const name = document.getElementById('full-name').value.trim();
  const address = document.getElementById('address').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const paymentEl = document.querySelector('input[name="payment"]:checked');
  const payment = paymentEl ? paymentEl.value : '';

  if (!name || name.length < 3) {
    showToast('Please enter your full name (min. 3 characters)', 'error');
    document.getElementById('full-name').focus();
    return;
  }
  if (!address || address.length < 10) {
    showToast('Please enter a complete address (min. 10 characters)', 'error');
    document.getElementById('address').focus();
    return;
  }
  if (!phone) {
    showToast('Please enter your phone number', 'error');
    document.getElementById('phone').focus();
    return;
  }
  if (!/^(\+62|62|0)[0-9]{8,13}$/.test(phone.replace(/[\s\-]/g, ''))) {
    showToast('Please enter a valid Indonesian phone number', 'error');
    return;
  }
  if (!payment) {
    showToast('Please select a payment method', 'error');
    return;
  }

  const cart = getCart();
  const user = getCurrentUser();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 15000;
  const total = subtotal + shipping;

  const transactionId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  const order = {
    id: transactionId,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    items: cart,
    subtotal,
    shipping,
    total,
    shippingInfo: { name, address, phone },
    paymentMethod: payment,
    status: 'Processing',
    createdAt: new Date().toISOString(),
  };

  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  saveCart([]);
  showSuccessModal(transactionId, total);
}

// ------------------------------------------------------------
// Success Modal
// ------------------------------------------------------------
function showSuccessModal(transactionId, total) {
  const modal = document.getElementById('success-modal');
  if (!modal) {
    showToast('Order placed successfully!', 'success');
    setTimeout(() => { window.location.href = 'orders.html'; }, 1500);
    return;
  }

  document.getElementById('modal-trx-id').textContent = transactionId;
  document.getElementById('modal-total').textContent = formatRupiah(total);
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  document.getElementById('modal-view-orders').addEventListener('click', () => {
    window.location.href = 'orders.html';
  });
  document.getElementById('modal-continue').addEventListener('click', () => {
    window.location.href = 'shop.html';
  });
}
