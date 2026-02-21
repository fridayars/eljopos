# 📘 PROJECT_GUIDE.md

## iPhone Repair & Sparepart Management System

### Vibe Coding Blueprint (Updated)

---

# 1️⃣ Product Overview

Sistem manajemen untuk:

* Service / repair iPhone
* Penjualan sparepart
* Multi-store inventory
* Role & permission based access
* Transaksi kasir & laporan

Digunakan untuk toko repair skala kecil – menengah, dengan kemungkinan berkembang multi-store.

---

# 2️⃣ Core Features

## 2.1 Authentication & Authorization

Login menggunakan:

* username / email
* password
* store

Setelah login:

* Generate JWT
* Simpan ke `log_session`
* Multi device login diperbolehkan
* Menu tampil sesuai permission role

Permission format:

```
customer.view
customer.add
product.edit
transaction.create
```

Permission dicek di backend.

---

# 3️⃣ Master Data

---

## 3.1 Store

* Multi store
* Stok terpisah per store
* Transaksi terikat ke store

---

## 3.2 Role & Access

Role memiliki banyak permission.
User memiliki 1 role.

---

## 3.3 Customer

* Data customer
* Riwayat transaksi

---

## 3.4 Kategori Produk

Digunakan untuk mengelompokkan sparepart.

Contoh:

* LCD
* Baterai
* Kamera
* IC
* Aksesoris

---

## 3.5 Produk (Sparepart)

Produk memiliki:

* kategori_produk
* stok per store
* import / export excel
* soft delete

---

## 3.6 Kategori Layanan

Digunakan untuk klasifikasi service.

Contoh:

* Hardware
* Software
* Maintenance
* Upgrade

---

## 3.7 Layanan (Service)

Layanan:

* Memiliki kategori_layanan
* Bisa memiliki banyak produk (produk_layanan)
* Saat dijual → produk otomatis terjual

---

# 4️⃣ ERD (High Level Structure)

## Core Entities

* users
* roles
* akses_role
* log_session
* stores
* customers
* kategori_produk
* products
* kategori_layanan
* layanan
* produk_layanan
* stok
* log_transfer_stok
* transaksi
* transaksi_detail

---

## ERD Reference Visual

![Image](https://svg.template.creately.com/hmnjgli21)

![Image](https://www.freeprojectz.com/sites/default/files/xInventory%2CP20Management%2CP20System.jpeg.pagespeed.ic.yC0-5dRqrw.jpg)

![Image](https://www.freeprojectz.com/sites/default/files/Product%20Service%20Management%20System.jpeg)

![Image](https://svg.template.creately.com/i230qmn52)

---

# 5️⃣ Database Schema

---

## 5.1 kategori_produk

```sql
id UUID PK
name VARCHAR(255)
description TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

Index:

* name

---

## 5.2 products

```sql
id UUID PK
kategori_produk_id UUID FK
name VARCHAR(255)
sku VARCHAR(100) UNIQUE
price NUMERIC(15,2)
cost_price NUMERIC(15,2)
created_at TIMESTAMP
updated_at TIMESTAMP
deleted_at TIMESTAMP
```

Index:

* sku
* kategori_produk_id

---

## 5.3 kategori_layanan

```sql
id UUID PK
name VARCHAR(255)
description TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## 5.4 layanan

```sql
id UUID PK
kategori_layanan_id UUID FK
name VARCHAR(255)
price NUMERIC(15,2)
description TEXT
```

Index:

* kategori_layanan_id

---

## 5.5 produk_layanan

```sql
id UUID PK
layanan_id UUID FK
product_id UUID FK
quantity INTEGER
```

UNIQUE(layanan_id, product_id)

---

## 5.6 stok

```sql
id UUID PK
product_id UUID FK
store_id UUID FK
quantity INTEGER
updated_at TIMESTAMP
```

UNIQUE(product_id, store_id)

---

## 5.7 transaksi_detail (Snapshot)

```sql
id UUID PK
transaksi_id UUID FK
item_type VARCHAR(20) -- product / layanan
item_id UUID
item_name VARCHAR(255)
kategori_name VARCHAR(255)
price NUMERIC(15,2)
quantity INTEGER
subtotal NUMERIC(15,2)
```

Snapshot kategori_name disarankan untuk laporan historis.

---

# 6️⃣ Transaksi Flow (Atomic Wajib)

```
Start DB Transaction
    ↓
Insert transaksi
    ↓
Insert transaksi_detail (snapshot)
    ↓
Kurangi stok (per store)
    ↓
Commit
```

Jika 1 langkah gagal → rollback semua.

---

# 7️⃣ Business Rules

* Tidak boleh stok minus
* SKU unik
* Layanan tidak boleh dihapus jika sudah pernah transaksi
* Produk tidak boleh hard delete
* Transfer stok harus mengurangi & menambah dalam 1 transaction

---

# 8️⃣ Optimization Strategy (WAJIB DIPERSIAPKAN)

Ini bagian penting supaya sistem kamu tidak “hancur” saat data mulai besar.

---

## 8.1 Index Optimization

Tambahkan index pada:

* transaksi (store_id, created_at)
* transaksi_detail (transaksi_id)
* stok (product_id, store_id)
* products (sku)
* customers (phone)

Tujuan:

* Laporan cepat
* Filter transaksi cepat
* Lookup SKU cepat

---

## 8.2 Transaction Performance

Gunakan:

* SELECT ... FOR UPDATE saat kurangi stok
* DB Transaction untuk kasir & transfer stok
* Hindari query dalam loop (gunakan bulk insert)

---

## 8.3 Snapshot Design (Sudah Benar)

Karena harga bisa berubah, maka:

* transaksi_detail wajib simpan snapshot name & price
* Jangan join ke tabel product saat generate laporan lama

---

## 8.4 Data Growth Strategy

Jika transaksi > 1 juta:

* Pertimbangkan partition table transaksi berdasarkan tahun
* Gunakan read replica untuk laporan
* Pisahkan service laporan berat

---

## 8.5 Import Excel Optimization

* Gunakan bulk insert
* Validasi di memory dulu sebelum insert
* Gunakan transaction saat import

---

## 8.6 Caching (Future)

Bisa gunakan Redis untuk:

* Cache permission role
* Cache kategori
* Cache produk populer

---

# 9️⃣ Potential Future Upgrade

* Serial number tracking per sparepart
* Repair ticket workflow (status tracking)
* Multi role per user
* Approval diskon besar
* Dashboard analytic grafik

---

# 1️⃣0️⃣ Vibe Coding Rules

* Business logic di service layer
* Semua stok operation centralized
* Jangan hard delete transaksi
* Database integrity > kecepatan coding
* Simplicity first

---

END OF DOCUMENT
