// ============================================================
// product-detail.js - Product Detail Page Logic
// ============================================================

let currentProduct = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));

  if (!productId) {
    window.location.href = 'shop.html';
    return;
  }

  await loadProductDetail(productId);
});

async function loadProductDetail(productId) {
  let products = [];
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error('Fetch failed');
    products = await res.json();
  } catch {
    products = typeof PRODUCTS_FALLBACK !== 'undefined' ? PRODUCTS_FALLBACK : [];
  }

  currentProduct = products.find((p) => p.id === productId);

  if (!currentProduct) {
    document.getElementById('product-container').innerHTML = `
      <div class="text-center py-20">
        <p class="text-gray-500 dark:text-gray-400 text-lg">Product not found.</p>
        <a href="shop.html" class="mt-4 inline-block text-indigo-600 hover:underline">← Back to Shop</a>
      </div>
    `;
    return;
  }

  renderProductDetail(currentProduct);
  loadRelatedProducts(currentProduct.id, currentProduct.category, products);
}

function renderProductDetail(product) {
  const container = document.getElementById('product-container');
  if (!container) return;

  const inWishlist = isInWishlist(product.id);
  const categoryColors = {
    Electronics: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    Fashion: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    Food: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  };
  const badgeClass = categoryColors[product.category] || 'bg-gray-100 text-gray-700';

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div class="space-y-4">
        <div class="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-700">
          <img id="main-image" src="${product.image}" alt="${product.name}"
            class="w-full h-80 sm:h-96 lg:h-[450px] object-cover" />
          ${product.stock <= 5 && product.stock > 0
            ? `<span class="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full font-semibold">Only ${product.stock} left!</span>`
            : ''}
          ${product.stock === 0
            ? `<div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                 <span class="bg-red-500 text-white text-lg font-bold px-6 py-3 rounded-xl">Out of Stock</span>
               </div>`
            : ''}
        </div>
        <div class="flex gap-3">
          ${[0, 1, 2].map((i) => {
            const imgUrl = i === 0 ? product.image : product.image.replace('/400/300', `/400/${300 + i}`);
            return `<button onclick="document.getElementById('main-image').src='${imgUrl}'"
              class="w-20 h-20 rounded-xl overflow-hidden border-2 border-transparent
                     hover:border-indigo-500 transition-colors flex-shrink-0">
              <img src="${imgUrl}" alt="View ${i + 1}" class="w-full h-full object-cover" />
            </button>`;
          }).join('')}
        </div>
      </div>

      <div class="space-y-5">
        <div>
          <span class="text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}">${product.category}</span>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-3">${product.name}</h1>
        </div>

        <div class="flex items-center gap-3">
          ${renderStars(product.rating)}
          <span class="text-sm text-gray-500 dark:text-gray-400">${product.rating} out of 5</span>
        </div>

        <div>
          <span class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            ${formatRupiah(product.price)}
          </span>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Description</h3>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">${product.description}</p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Availability:</span>
          ${product.stock > 0
            ? `<span class="text-sm font-semibold text-green-600 dark:text-green-400">In Stock (${product.stock} available)</span>`
            : `<span class="text-sm font-semibold text-red-500">Out of Stock</span>`}
        </div>

        ${product.stock > 0 ? `
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
          <div class="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button id="qty-decrease"
              class="w-9 h-9 rounded-lg bg-white dark:bg-gray-600 shadow-sm font-bold text-gray-700
                     dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors
                     flex items-center justify-center text-lg">−</button>
            <span id="qty-display" class="w-10 text-center font-bold text-gray-800 dark:text-white text-lg">1</span>
            <button id="qty-increase"
              class="w-9 h-9 rounded-lg bg-white dark:bg-gray-600 shadow-sm font-bold text-gray-700
                     dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors
                     flex items-center justify-center text-lg">+</button>
          </div>
        </div>
        ` : ''}

        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          ${product.stock > 0
            ? `<button id="add-to-cart-btn"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6
                       rounded-xl transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>`
            : `<button disabled
                class="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold
                       py-3 px-6 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                Out of Stock
              </button>`}
          <button id="wishlist-btn"
            class="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-2
                   ${inWishlist
                     ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20'
                     : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-400 hover:text-red-500'}
                   transition-colors font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
              fill="${inWishlist ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            ${inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
          </button>
        </div>

        <a href="shop.html"
          class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400
                 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shop
        </a>
      </div>
    </div>
  `;

  // Quantity controls
  let qty = 1;
  const qtyDisplay = document.getElementById('qty-display');
  document.getElementById('qty-decrease')?.addEventListener('click', () => {
    if (qty > 1) { qty--; qtyDisplay.textContent = qty; }
  });
  document.getElementById('qty-increase')?.addEventListener('click', () => {
    if (qty < product.stock) { qty++; qtyDisplay.textContent = qty; }
    else showToast(`Maximum stock is ${product.stock}`, 'warning');
  });

  // Add to cart
  document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
    addToCart(product, qty);
  });

  // Wishlist
  document.getElementById('wishlist-btn')?.addEventListener('click', function () {
    const added = toggleWishlist(product.id);
    this.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
        fill="${added ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      ${added ? 'In Wishlist' : 'Add to Wishlist'}
    `;
    this.className = `flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-2
      ${added ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-400 hover:text-red-500'}
      transition-colors font-semibold`;
  });
}

function loadRelatedProducts(currentId, category, products) {
  const container = document.getElementById('related-products');
  if (!container) return;

  const related = products.filter((p) => p.category === category && p.id !== currentId).slice(0, 4);
  if (related.length === 0) {
    const section = document.getElementById('related-section');
    if (section) section.style.display = 'none';
    return;
  }

  container.innerHTML = related.map((p) => `
    <a href="product.html?id=${p.id}"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100
             dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group">
      <img src="${p.image}" alt="${p.name}"
        class="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
      <div class="p-3">
        <p class="text-sm font-medium text-gray-800 dark:text-white overflow-hidden"
           style="display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;">${p.name}</p>
        <p class="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-1">${formatRupiah(p.price)}</p>
      </div>
    </a>
  `).join('');
}
