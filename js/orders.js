// ============================================================
// orders.js - Order History Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  renderOrders();
});

function renderOrders() {
  const user = getCurrentUser();
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const orders = allOrders.filter((o) => o.userEmail === user.email);

  const container = document.getElementById('orders-list');
  const emptyState = document.getElementById('empty-orders');
  const orderCount = document.getElementById('order-count');

  if (!container) return;

  if (orderCount) orderCount.textContent = `${orders.length} order${orders.length !== 1 ? 's' : ''}`;

  if (orders.length === 0) {
    container.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');
  container.innerHTML = orders.map(createOrderCard).join('');

  container.querySelectorAll('.order-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const detail = document.getElementById(`order-detail-${btn.dataset.id}`);
      const icon = btn.querySelector('.toggle-icon');
      if (detail) {
        detail.classList.toggle('hidden');
        if (icon) icon.style.transform = detail.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  });
}

function createOrderCard(order) {
  const statusColors = {
    Processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    Shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    Delivered: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };
  const statusClass = statusColors[order.status] || statusColors.Processing;

  const date = new Date(order.createdAt);
  const formattedDate = date.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const paymentLabels = {
    bank_transfer: 'Transfer Bank',
    cod: 'Cash on Delivery',
    ewallet: 'E-Wallet',
  };

  const itemPreview = order.items.slice(0, 3).map((item) => `
    <img src="${item.image}" alt="${item.name}"
      class="w-10 h-10 object-cover rounded-lg border-2 border-white dark:border-gray-700"
      title="${item.name}" />
  `).join('');

  const extraItems = order.items.length > 3
    ? `<span class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center
                    text-xs font-bold text-gray-600 dark:text-gray-300">+${order.items.length - 3}</span>`
    : '';

  return `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100
                dark:border-gray-700 overflow-hidden">
      <div class="p-4 sm:p-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">${order.id}</span>
              <span class="text-xs px-2 py-1 rounded-full font-semibold ${statusClass}">${order.status}</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${formattedDate}</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-gray-800 dark:text-white">${formatRupiah(order.total)}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">${order.items.length} item(s)</p>
          </div>
        </div>
        <div class="flex items-center gap-2 mt-3">
          <div class="flex -space-x-2">${itemPreview}${extraItems}</div>
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
            ${order.items.map((i) => i.name).slice(0, 2).join(', ')}${order.items.length > 2 ? '...' : ''}
          </span>
        </div>
        <button class="order-toggle mt-3 flex items-center gap-1 text-sm text-indigo-600
                       dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200
                       transition-colors font-medium" data-id="${order.id}">
          <span>View Details</span>
          <svg class="toggle-icon h-4 w-4 transition-transform duration-200"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div id="order-detail-${order.id}" class="hidden border-t border-gray-100 dark:border-gray-700">
        <div class="p-4 sm:p-5 space-y-4">
          <div>
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Order Items</h4>
            <div class="space-y-3">
              ${order.items.map((item) => `
                <div class="flex items-center gap-3">
                  <img src="${item.image}" alt="${item.name}"
                    class="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 dark:text-white overflow-hidden"
                       style="display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;">${item.name}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      ${formatRupiah(item.price)} × ${item.quantity}
                    </p>
                  </div>
                  <span class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    ${formatRupiah(item.price * item.quantity)}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal</span><span>${formatRupiah(order.subtotal)}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Shipping</span><span>${formatRupiah(order.shipping)}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-gray-800 dark:text-white
                        border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
              <span>Total</span>
              <span class="text-indigo-600 dark:text-indigo-400">${formatRupiah(order.total)}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h5 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Shipping To</h5>
              <p class="text-sm font-semibold text-gray-800 dark:text-white">${order.shippingInfo.name}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${order.shippingInfo.address}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">${order.shippingInfo.phone}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h5 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Payment</h5>
              <p class="text-sm font-semibold text-gray-800 dark:text-white">
                ${paymentLabels[order.paymentMethod] || order.paymentMethod}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Status: ${order.status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
