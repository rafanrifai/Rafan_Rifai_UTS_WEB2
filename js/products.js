// ============================================================
// products.js - Product Listing, Search & Filter
// ============================================================

// Fallback data (used when fetch fails on file:// protocol)
const PRODUCTS_FALLBACK = [
  { id: 1, name: "Wireless Bluetooth Headphones", price: 450000, image: "https://picsum.photos/seed/prod1/400/300", description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and remote workers.", category: "Electronics", rating: 4.5, stock: 15 },
  { id: 2, name: "Smartphone Stand & Charger", price: 185000, image: "https://picsum.photos/seed/prod2/400/300", description: "Adjustable aluminum smartphone stand with built-in 15W wireless charging pad. Compatible with all Qi-enabled devices.", category: "Electronics", rating: 4.2, stock: 25 },
  { id: 3, name: "Mechanical Gaming Keyboard", price: 750000, image: "https://picsum.photos/seed/prod3/400/300", description: "Full-size mechanical keyboard with RGB backlight, tactile blue switches, and durable aluminum frame. Ideal for gaming and typing enthusiasts.", category: "Electronics", rating: 4.7, stock: 8 },
  { id: 4, name: "USB-C Hub 7-in-1", price: 320000, image: "https://picsum.photos/seed/prod4/400/300", description: "Compact 7-in-1 USB-C hub with HDMI 4K, 3x USB 3.0, SD card reader, and 100W PD charging. Essential for laptop users.", category: "Electronics", rating: 4.3, stock: 20 },
  { id: 5, name: "Men's Casual Polo Shirt", price: 175000, image: "https://picsum.photos/seed/prod5/400/300", description: "Comfortable 100% cotton polo shirt available in multiple colors. Slim fit design suitable for casual and semi-formal occasions.", category: "Fashion", rating: 4.1, stock: 50 },
  { id: 6, name: "Women's Floral Dress", price: 285000, image: "https://picsum.photos/seed/prod6/400/300", description: "Elegant floral print midi dress with adjustable waist tie. Made from breathable chiffon fabric, perfect for summer outings.", category: "Fashion", rating: 4.6, stock: 30 },
  { id: 7, name: "Leather Crossbody Bag", price: 395000, image: "https://picsum.photos/seed/prod7/400/300", description: "Genuine leather crossbody bag with multiple compartments and adjustable strap. Stylish and functional for everyday use.", category: "Fashion", rating: 4.4, stock: 18 },
  { id: 8, name: "Running Sneakers", price: 520000, image: "https://picsum.photos/seed/prod8/400/300", description: "Lightweight running shoes with responsive foam cushioning and breathable mesh upper. Designed for long-distance comfort.", category: "Fashion", rating: 4.8, stock: 22 },
  { id: 9, name: "Organic Green Tea (100g)", price: 65000, image: "https://picsum.photos/seed/prod9/400/300", description: "Premium Japanese matcha green tea, stone-ground from shade-grown leaves. Rich in antioxidants with a smooth, earthy flavor.", category: "Food", rating: 4.5, stock: 100 },
  { id: 10, name: "Dark Chocolate Gift Box", price: 120000, image: "https://picsum.photos/seed/prod10/400/300", description: "Assorted premium dark chocolates with 70% cacao content. Includes 12 handcrafted pieces in an elegant gift box.", category: "Food", rating: 4.7, stock: 45 },
  { id: 11, name: "Cold Brew Coffee Pack", price: 95000, image: "https://picsum.photos/seed/prod11/400/300", description: "Ready-to-brew cold brew coffee kit with 6 single-serve bags of specialty Arabica beans. Smooth, low-acid taste.", category: "Food", rating: 4.3, stock: 60 },
  { id: 12, name: "Mixed Nuts & Dried Fruits", price: 145000, image: "https://picsum.photos/seed/prod12/400/300", description: "Premium blend of almonds, cashews, walnuts, and dried cranberries. No added sugar or preservatives. 500g resealable pack.", category: "Food", rating: 4.4, stock: 75 }
];

let allProducts = [];
let activeCategory = 'All';
let searchQuery = '';
let maxPrice = Infinity;

// ------------------------------------------------------------
// Load Products
// ------------------------------------------------------------
async function loadProducts() {
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error('Fetch failed');
    allProducts = await res.json();
  } catch {
    allProducts = PRODUCTS_FALLBACK;
  }
  renderProducts();
  setupPriceRange();
}

// ------------------------------------------------------------
// Render Product Cards
// ------------------------------------------------------------
function renderProducts() {
  const grid = document.getElementById('product-grid');
  const emptyState = document.getElementById('empty-state');
  if (!grid) return;

  const filtered = filterProducts();
  const countEl = document.getElementById('product-count');
  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }
  if (emptyState) emptyState.classList.add('hidden');

  grid.innerHTML = filtered.map(createProductCard).join('');

  grid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = allProducts.find((p) => p.id === parseInt(btn.dataset.id));
      if (product) addToCart(product);
    });
  });

  grid.querySelectorAll('.wishlist-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = parseInt(btn.dataset.id);
      const added = toggleWishlist(id);
      const svg = btn.querySelector('svg');
      btn.classList.toggle('text-red-500', added);
      btn.classList.toggle('text-gray-400', !added);
      if (svg) svg.setAttribute('fill', added ? 'currentColor' : 'none');
    });
  });
}

function createProductCard(product) {
  const inWishlist = isInWishlist(product.id);
  const categoryColors = {
    Electronics: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    Fashion: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    Food: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  };
  const badgeClass = categoryColors[product.category] || 'bg-gray-100 text-gray-700';

  return `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl
                transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      <a href="product.html?id=${product.id}" class="block relative overflow-hidden">
        <img src="${product.image}" alt="${product.name}"
          class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy" />
        <button class="wishlist-btn absolute top-3 right-3 p-2 bg-white dark:bg-gray-700
                       rounded-full shadow-md transition-colors ${inWishlist ? 'text-red-500' : 'text-gray-400'}"
          data-id="${product.id}" title="Wishlist">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
            fill="${inWishlist ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        ${product.stock <= 5 ? `<span class="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">Low Stock</span>` : ''}
      </a>
      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold px-2 py-1 rounded-full ${badgeClass}">${product.category}</span>
          <div class="flex items-center gap-1">${renderStars(product.rating)}</div>
        </div>
        <a href="product.html?id=${product.id}">
          <h3 class="font-semibold text-gray-800 dark:text-white text-sm mb-1
                     hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors
                     overflow-hidden" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
            ${product.name}
          </h3>
        </a>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-3 overflow-hidden"
           style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
          ${product.description}
        </p>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            ${formatRupiah(product.price)}
          </span>
          <button class="add-to-cart-btn bg-indigo-600 hover:bg-indigo-700 text-white
                         text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
            data-id="${product.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>
  `;
}

// ------------------------------------------------------------
// Filter Logic
// ------------------------------------------------------------
function filterProducts() {
  return allProducts.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice = p.price <= maxPrice;
    return matchCat && matchSearch && matchPrice;
  });
}

// ------------------------------------------------------------
// Category Filter Buttons
// ------------------------------------------------------------
function setupCategoryFilters() {
  document.querySelectorAll('.category-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      document.querySelectorAll('.category-btn').forEach((b) => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-white', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-200');
      });
      btn.classList.add('bg-indigo-600', 'text-white');
      btn.classList.remove('bg-white', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-200');
      renderProducts();
    });
  });
}

// ------------------------------------------------------------
// Search
// ------------------------------------------------------------
function setupSearch() {
  const handleSearch = (e) => {
    searchQuery = e.target.value;
    document.querySelectorAll('#search-input, #nav-search').forEach((el) => {
      el.value = searchQuery;
    });
    renderProducts();
  };
  document.getElementById('search-input')?.addEventListener('input', handleSearch);
  document.getElementById('nav-search')?.addEventListener('input', handleSearch);
}

// ------------------------------------------------------------
// Price Range Filter
// ------------------------------------------------------------
function setupPriceRange() {
  const maxProductPrice = Math.max(...allProducts.map((p) => p.price));
  const priceRange = document.getElementById('price-range');
  const priceLabel = document.getElementById('price-label');
  if (!priceRange) return;

  priceRange.max = maxProductPrice;
  priceRange.value = maxProductPrice;
  maxPrice = maxProductPrice;
  if (priceLabel) priceLabel.textContent = formatRupiah(maxProductPrice);

  priceRange.addEventListener('input', () => {
    maxPrice = parseInt(priceRange.value);
    if (priceLabel) priceLabel.textContent = formatRupiah(maxPrice);
    renderProducts();
  });
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  loadProducts();
  setupCategoryFilters();
  setupSearch();
});
