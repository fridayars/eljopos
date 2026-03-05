# API Contract - eljoPOS

Dokumen ini mendefinisikan kontrak API untuk aplikasi eljoPOS, mengacu pada aturan standar respons di `DEVELOPMENT_GUIDE.md` (*Success: true/data, Error: false/message/errors*) serta struktur entitas pada `PROJECT_GUIDE.md`.

Base URL: `http://localhost:3000/api` (atau disesuaikan dengan konfigurasi environment)
Standar Header (Kecuali Login): `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication (Auth)

### 1.1 Login
- **URL Route**: `POST /auth/login`
- **Deskripsi**: API untuk login user kedalam sistem dan mendapatkan JWT token beserta informasi role & store.
- **Request Header**: `Content-Type: application/json`
- **Request Query**: Tidak ada
- **Request Body**:
  ```json
  {
    "username": "admin123", /* atau email */
    "password": "password123",
    "store_id": "uuid-store-1" /* Opsional/Mandatory tergantung bisnis logic */
  }
  ```
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
      "user": {
        "user_id": "uuid",
        "username": "admin123",
        "role": "admin",
        "store_id": "uuid",
        "permissions": [
          "customer.view",
          "customer.add",
          "product.edit",
          "transaction.create"
        ]
      }
    }
  }
  ```
- **Response 400 (Bad Request / Validation Error)**:
  ```json
  {
    "success": false,
    "message": "Validation error",
    "errors": [
      { "field": "username", "message": "Username is required" }
    ]
  }
  ```

### 1.2 Logout
- **URL Route**: `POST /auth/logout`
- **Deskripsi**: API untuk mencatat aktivitas logout pada log_session dan invalidasi sisi client.
- **Request Header**: `Authorization: Bearer <token>`
- **Request Query**: Tidak ada
- **Request Body**: Tidak ada / Kosong
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Logout successful"
    }
  }
  ```
- **Response 400/401 (Error)**:
  ```json
  {
    "success": false,
    "message": "Invalid token or unauthorized"
  }
  ```

---

## 2. CRUD Data Master

> *Catatan: Pola di bawah berlaku sama secara umum untuk Kategori Produk, Produk, Kategori Layanan, Layanan, dan Customer. Berikut adalah representasi untuk moduler Produk sebagai contoh kontrak standarnya.*

### 2.1 Get All Products
- **URL Route**: `GET /master/products`
- **Deskripsi**: API untuk mengambil daftar produk (sparepart) dengan dukungan pagination dan filter pencarian.
- **Request Header**: `Authorization: Bearer <token>`
- **Request Query**: 
  - `store_id` (opsional)
  - `page=1`
  - `limit=10`
  - `search=lcd` (opsional)
  - `sort=name:asc` (opsional)
  - `sort=price:asc` (opsional)
  - `sort=stock:asc` (opsional)
  - `sort=created_at:desc` (default sort)
  - `sort=is_active:asc` (opsional)
  - `sort=kategori_name:asc` (opsional)
  - `sort=sku:asc` (opsional)
- **Request Body**: Tidak ada
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "uuid",
          "kategori_name": "LCD",
          "name": "LCD iPhone X",
          "sku": "IPX-LCD-01",
          "image_url": "https://example.com/image.jpg",
          "price": 500000,
          "stok": 10,
          "is_active": true
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 50,
        "total_pages": 5,
        "has_next": true,
        "has_prev": false
      }
    }
  }
  ```

### 2.2 Create Product
- **URL Route**: `POST /master/products`
- **Deskripsi**: API untuk menambahkan produk sparepart baru.
- **Request Header**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Query**: 
  - `store_id` (opsional)
- **Request Body**:
  ```json
  {
    "kategori_produk_id": "uuid",
    "name": "Baterai iPhone 11",
    "sku": "IP11-BAT-01",
    "price": 250000,
    "cost_price": 150000,
    "is_active": true,
    "image_url": "https://example.com/image.jpg",
    "stock": 10,
    "jasa_pasang": 10000,
    "ongkir_asuransi": 10000,
    "biaya_overhead": 10000,
  }
  ```
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Baterai iPhone 11"
    }
  }
  ```
- **Response 400 (Validation Error)**:
  ```json
  {
    "success": false,
    "message": "Validation error",
    "errors": [
      { "field": "sku", "message": "SKU must be unique" }
    ]
  }
  ```

### 2.3 Update Product
- **URL Route**: `PUT /master/products/:id`
- **Deskripsi**: API untuk mengubah data produk eksisting.
- **Request Param**: `id` (UUID produk)
- **Request Body**: Sama seperti Create Product
- **Response 200 (Success)**: Same pattern as Success True Data.
- **Response 400 (Validation Error)**: Error messages validasi.

### 2.4 Delete Product (Soft Delete)
- **URL Route**: `DELETE /master/products/:id`
- **Deskripsi**: API untuk melakukan soft delete pada produk.
- **Request Param**: `id` (UUID produk)
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Product deleted successfully"
    }
  }

### 2.4.1 Update Status Product
- **URL Route**: `PUT /master/products/:id/status`
- **Deskripsi**: API untuk mengubah status produk (aktif/tidak aktif).
- **Request Param**: `id` (UUID produk)
- **Request Body**: 
  ```json
  {
    "is_active": true
  }
  ```
- **Response 200 (Success)**: Same pattern as Success True Data.
- **Response 400 (Validation Error)**: Error messages validasi.

### 2.5 Service (Layanan) & Service Categories (Kategori Layanan)
> *Catatan: Struktur dan pola respons mengikuti modul Produk. Endpoint layanan mengelola data layanan yang dapat memiliki relasi ke produk melalui tabel produk_layanan.*

### 2.5 Get All Service Categories
- **URL Route**: `GET /master/layanan/categories`
- **Deskripsi**: Mengambil daftar kategori layanan. Mengembalikan daftar penuh (tanpa pagination) untuk keperluan dropdown di UI.
- **Request Header**: `Authorization: Bearer <token>`
- **Request Query**:
  - `search` (opsional)
  - `sort=name:asc` (opsional)
- **Request Body**: Tidak ada
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        { "id": "uuid", "name": "Hardware", "description": "Service kategori hardware", "is_active": true }
      ]
    }
  }
  ```

### 2.6 Get All Services
- **URL Route**: `GET /master/layanan`
- **Deskripsi**: Mengambil daftar layanan dengan dukungan pagination, pencarian, dan sorting.
- **Request Header**: `Authorization: Bearer <token>`
- **Request Query**:
  - `store_id` (opsional)
  - `page=1`
  - `limit=10`
  - `search=pasang` (opsional)
  - `kategori_layanan_id` (opsional)
  - `sort=created_at:desc` (default sort)
- **Request Body**: Tidak ada
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "uuid",
          "kategori_name": "Hardware",
          "name": "Pasang LCD",
          "price": 250000,
          "cost_price": 100000,
          "description": "Jasa pemasangan LCD",
          "count_product": 2,
          "is_active": true
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 25,
        "total_pages": 3,
        "has_next": true,
        "has_prev": false
      }
    }
  }
  ```

### 2.7 Create Service
- **URL Route**: `POST /master/layanan`
- **Deskripsi**: Menambahkan layanan baru. Layanan dapat dikaitkan dengan produk melalui relasi produk_layanan (opsional).
- **Request Header**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "kategori_layanan_id": "uuid",
    "store_id": "uuid",
    "name": "Pasang LCD",
    "price": 250000,
    "cost_price": 100000,
    "biaya_overhead": 10000, // optional
    "description": "Jasa pemasangan LCD", // optional
    "is_active": true,
    "products": [
      { "sku": "IPX-LCD-01" },
      { "sku": "IP11-BAT-01" }
    ]
  }
  ```
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Pasang LCD"
    }
  }
  ```
- **Response 400 (Validation Error)**:
  ```json
  {
    "success": false,
    "message": "Validation error",
    "errors": [
      { "field": "name", "message": "Name is required" }
    ]
  }
  ```

### 2.8 Update Service
- **URL Route**: `PUT /master/layanan/:id`
- **Deskripsi**: Mengubah data layanan yang sudah ada. Body sama seperti Create Service.
- **Request Param**: `id` (UUID layanan)
- **Response 200 (Success)**: Sama pola respons sukses.

### 2.9 Delete Service (Soft Delete)
- **URL Route**: `DELETE /master/layanan/:id`
- **Deskripsi**: Melakukan soft delete pada layanan.
- **Request Param**: `id` (UUID layanan)
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": { "message": "Service deleted successfully" }
  }
  ```

### 2.10 Update Status Service
- **URL Route**: `PUT /master/layanan/:id/status`
- **Deskripsi**: Mengubah status layanan (aktif/tidak aktif).
- **Request Param**: `id` (UUID layanan)
- **Request Body**:
  ```json
  {
    "is_active": true
  }
  ```
- **Response 200 (Success)**:
  ```json
    "success": true,
    "data": { "message": "Service deleted successfully" }
  }
  ```

### 2.11 Detail Service
- **URL Route**: `GET /master/layanan/:id`
- **Deskripsi**: Mengambil detail layanan berdasarkan ID.
- **Request Param**: `id` (UUID layanan)
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Pasang LCD",
      "price": 250000,
      "cost_price": 100000,
      "biaya_overhead": 10000,
      "description": "Jasa pemasangan LCD",
      "store_id": "uuid",
      "store_name": "Store 1",
      "kategori_layanan_id": "uuid",
      "kategori_name": "Hardware",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "deleted_at": null,
      "produkLayanan": [
        {
          "id": "uuid",
          "sku": "IPX-LCD-01",
          "name": "LCD 14"
        }
      ]
    }
  }
  ```

(Catatan: Export/Import untuk layanan tersedia di `/master/layanan/export` dan `/master/layanan/import`, menggunakan pola dan header yang sama seperti Produk Import/Export.)
  ```

---

## 3. Export & Import Excel

### 3.1 Export Produk
- **URL Route**: `GET /master/products/export`
- **Deskripsi**: API untuk mengunduh data produk dalam format file Excel.
- **Request Header**: `Authorization: Bearer <token>`
- **Request Query**: `store_id` (opsional)
- **Response 200 (Success)**: Binary stream file `.xlsx` dengan header `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
- **Response 400 (Error)**:
  ```json
  {
    "success": false,
    "message": "Failed to generate excel file"
  }
  ```

### 3.2 Import Produk
- **URL Route**: `POST /master/products/import`
- **Deskripsi**: API untuk mengunggah dan memproses file Excel berisi data produk dan layanan (Bulk Insert menggunakan DB Transaction).
- **Request Header**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Request Query**: `store_id` (opsional)
- **Request Body**: Param form data dengan key `file` (File Excel .xlsx)
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Products imported successfully",
      "total_inserted": 150,
      "total_updated": 0,
      "total_deleted": 0,
      "total_skipped": 0
    }
  }
  ```
- **Response 400 (Validation Error / Transaction Error)**:
  ```json
  {
    "success": false,
    "message": "Excel structure invalid or data errors",
    "errors": [
      { "field": "row_5", "message": "SKU already exists" }
    ]
  }
  ```

*(Catatan: Endpoint Export/Import untuk entitas Layanan menggunakan struktur serupa dengan rute `/master/layanan/export` dan `/master/layanan/import`)*

---

## 4. Kasir & Laporan

### 4.1 Buat Transaksi (Kasir)
- **URL Route**: `POST /transaksi`
- **Deskripsi**: API untuk merekam transaksi penjualan / service baru. Menggunakan DB Transaction secara atomik (insert transaksi, insert detail, kurangi stok terikat store).
- **Request Header**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "store_id": "uuid-store",
    "customer_id": "uuid-customer",
    "total_amount": 750000,
    "payment_method": [
      {
        "method": "CASH",
        "amount": 750000
      },
      {
        "method": "TRANSFER",
        "amount": 750000
      }
    ],
    "items": [
      {
        "item_type": "product",
        "item_id": "uuid-product",
        "item_name": "LCD iPhone X",
        "kategori_name": "LCD",
        "price": 500000,
        "quantity": 1,
        "subtotal": 500000
      },
      {
        "item_type": "layanan",
        "item_id": "uuid-layanan",
        "item_name": "Pasang LCD",
        "kategori_name": "Hardware",
        "price": 250000,
        "quantity": 1,
        "subtotal": 250000
      }
    ]
  }
  ```
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "transaksi_id": "uuid-transaksi",
      "invoice_number": "INV/20260221/001"
    }
  }
  ```
- **Response 400 (Error Transaction / Stock Minus)**:
  ```json
  {
    "success": false,
    "message": "Transaction failed: Insufficient stock for LCD iPhone X"
  }
  ```

### 4.2 Laporan Penjualan (Histori)
- **URL Route**: `GET /laporan/penjualan`
- **Deskripsi**: API untuk melihat daftar laporan transaksi. Sistem ini wajib mengambil snapshot data penjualan.
- **Request Header**: `Authorization: Bearer <token>`
- **Request Query**:
  - `start_date=2026-02-01`
  - `end_date=2026-02-28`
  - `store_id=uuid-store`
  - `page=1`
  - `limit=20`
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "total_revenue": 15000000,
        "total_transactions": 25
      },
      "items": [
        {
          "id": "uuid-transaksi",
          "invoice_number": "INV/20260221/001",
          "created_at": "2026-02-21T10:00:00Z",
          "customer_name": "John Doe",
          "total_amount": 750000,
          "type": "product",
          "kasir": "jon",
          "store": "Jombang"
        }
      ],
      "meta": {
        "page": 1,
        "limit": 20,
        "total": 25
      }
    }
  }
  ```
- **Response 400 (Validation Error)**:
  ```json
  {
    "success": false,
    "message": "Validation error",
    "errors": [
      { "field": "start_date", "message": "Start date is required" }
    ]
  }
  ```

---

## 5. Dashboard

### 5.1 Ringkasan Statistik Dashboard
- **URL Route**: `GET /dashboard/summary`
- **Deskripsi**: API untuk mengambil statistik ringkasan hari ini, digunakan pada halaman Dashboard.
- **Request Header**: `Authorization: Bearer <token>`
- **Request Query**: 
  - `store_id=uuid-store` (opsional)
- **Request Body**: Tidak ada
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "today_sales": 2450000,
      "total_transactions": 48,
      "total_new_customers": 32,
      "low_stock_items": 7,
      "sales_change": "+12.5%", // perbandingan dengan hari sebelumnya
      "transactions_change": "+8.2%", // perbandingan dengan hari sebelumnya
      "new_customers_change": "+5.1%", // perbandingan dengan hari sebelumnya
      "low_stock_change": "-2", // perbandingan dengan hari sebelumnya, stock < 10
      "notes": ""
    }
  }
  ```

### 5.2 Transaksi Terbaru
- **URL Route**: `GET /dashboard/recent-transactions`
- **Deskripsi**: API untuk mengambil 5 transaksi terbaru untuk ditampilkan di Dashboard.
- **Request Header**: `Authorization: Bearer <token>`
- **Request Query**: 
  - `store_id=uuid-store` (opsional)
- **Request Body**: Tidak ada
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid-transaksi",
        "invoice_number": "INV/20260228/048",
        "created_at": "2026-02-28T10:30:00Z",
        "customer_name": "Sarah Williams",
        "total_amount": 750000,
        "payment_method": ["CASH"],
        "items_count": 3
      }
    ]
  }
  ```
