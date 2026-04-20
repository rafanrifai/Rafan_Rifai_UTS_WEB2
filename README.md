# ShopKu – Online Shop

Aplikasi online shop fullstack berbasis JavaScript Vanilla + Tailwind CSS. Dibuat sebagai proyek UTS Pemrograman Web 2.

## Deskripsi Project

ShopKu adalah aplikasi e-commerce sederhana yang memungkinkan pengguna untuk:
- Mendaftar dan login ke akun mereka
- Menjelajahi produk dari berbagai kategori
- Mencari dan memfilter produk
- Menambahkan produk ke keranjang belanja
- Melakukan checkout dan menyimpan riwayat transaksi

## Fitur

### Fitur Wajib
- ✅ **Authentication** – Login & Register dengan validasi (email unik, password min. 6 karakter)
- ✅ **Product Management** – Menampilkan 12 produk dari JSON dengan detail produk
- ✅ **Search & Filter** – Pencarian real-time berdasarkan nama + filter kategori + filter harga
- ✅ **Cart (Keranjang)** – Tambah, hapus, update jumlah item, total harga otomatis
- ✅ **Checkout** – Form (Nama, Alamat, No HP), pilihan metode pembayaran, generate ID transaksi
- ✅ **Order History** – Riwayat pembelian per user dengan detail transaksi yang bisa di-expand
- ✅ **UI/UX Tailwind** – Responsive (mobile + desktop), Navbar, Product Grid, Cart Page, Checkout Page
- ✅ **State Management** – LocalStorage untuk user session, cart, dan orders

### Fitur Bonus
- ✅ **Dark Mode** – Toggle dark/light mode, tersimpan di LocalStorage
- ✅ **Wishlist** – Tambah/hapus produk dari wishlist
- ✅ **Toast Notifications** – Notifikasi slide-in untuk setiap aksi

## Teknologi

- HTML5
- JavaScript ES6+ (Vanilla)
- Tailwind CSS (via CDN)
- LocalStorage
- JSON (dummy data)

## Struktur File

```
├── index.html          # Halaman Login & Register
├── shop.html           # Halaman utama toko
├── product.html        # Halaman detail produk
├── cart.html           # Halaman keranjang belanja
├── checkout.html       # Halaman checkout
├── orders.html         # Halaman riwayat pesanan
├── data/
│   └── products.json   # Data produk (12 produk, 3 kategori)
├── js/
│   ├── app.js          # Shared utilities (toast, dark mode, auth, cart helpers)
│   ├── auth.js         # Logic login & register
│   ├── products.js     # Product listing, search, filter
│   ├── cart.js         # Cart CRUD logic
│   ├── checkout.js     # Checkout & order creation
│   ├── orders.js       # Order history
│   └── product-detail.js # Product detail page
└── README.md
```

## Cara Menjalankan

### Opsi 1: Menggunakan Live Server (Recommended)
1. Install ekstensi **Live Server** di VS Code
2. Klik kanan `index.html` → **Open with Live Server**
3. Browser akan otomatis membuka `http://127.0.0.1:5500`

### Opsi 2: Langsung buka file
1. Buka file `index.html` langsung di browser
2. Aplikasi akan berjalan menggunakan data fallback (embedded di `products.js`)

### Cara Menggunakan
1. Buka `index.html` → Klik **Create Account** untuk mendaftar
2. Login dengan akun yang sudah dibuat
3. Jelajahi produk, gunakan search dan filter
4. Klik produk untuk melihat detail
5. Tambahkan ke cart → Checkout → Lihat riwayat di My Orders

## Link Demo

https://rafanrifai.github.io/Rafan_Rifai_UTS_WEB2/

## Kategori Produk

| Kategori | Produk |
|----------|--------|
| 💻 Electronics | Headphones, Smartphone Stand, Keyboard, USB Hub |
| 👗 Fashion | Polo Shirt, Floral Dress, Crossbody Bag, Sneakers |
| 🍎 Food | Green Tea, Chocolate Box, Cold Brew Coffee, Mixed Nuts |

## Penilaian

| Aspek | Bobot |
|-------|-------|
| Fungsionalitas | 35% |
| UI/UX (Tailwind) | 20% |
| Struktur kode | 15% |
| Logic JavaScript | 20% |
| Deployment & kelengkapan | 10% |
