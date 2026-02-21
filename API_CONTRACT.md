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
        "id": "uuid-user",
        "username": "admin123",
        "role": "Admin",
        "store_id": "uuid-store-1"
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
  - `page=1`
  - `limit=10`
  - `search=lcd` (opsional)
  - `kategori_id=uuid` (opsional)
- **Request Body**: Tidak ada
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "uuid",
          "kategori_produk_id": "uuid-kategori",
          "name": "LCD iPhone X",
          "sku": "IPX-LCD-01",
          "price": 500000,
          "cost_price": 350000,
          "stok": 10
        }
      ],
      "meta": {
        "page": 1,
        "limit": 10,
        "total": 50
      }
    }
  }
  ```

### 2.2 Create Product
- **URL Route**: `POST /master/products`
- **Deskripsi**: API untuk menambahkan produk sparepart baru.
- **Request Header**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "kategori_produk_id": "uuid",
    "name": "Baterai iPhone 11",
    "sku": "IP11-BAT-01",
    "price": 250000,
    "cost_price": 150000
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
- **Deskripsi**: API untuk mengunggah dan memproses file Excel berisi data produk (Bulk Insert menggunakan DB Transaction).
- **Request Header**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Request Body**: Param form data dengan key `file` (File Excel .xlsx)
- **Response 200 (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Products imported successfully",
      "total_inserted": 150
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
    "payment_method": "CASH",
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
          "invoice_number": "INV/20260221/001",
          "created_at": "2026-02-21T10:00:00Z",
          "customer_name": "John Doe",
          "total_amount": 750000
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
