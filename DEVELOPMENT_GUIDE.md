# AI Development Guide

Store Service Management & POS Application

------------------------------------------------------------------------

# 1. Project Stack

Backend: - Node.js - Express.js - PostgreSQL - Sequelize ORM -
express-validator - JWT Authentication

Frontend: - React (Vite) - TypeScript - Tailwind CSS - Axios

Architecture: - REST API Communication

------------------------------------------------------------------------

# 2. Project Initialization

------------------------------------------------------------------------

## Backend Initialization

``` bash
mkdir backend
cd backend
npm init -y
```

Install dependencies:

``` bash
npm install express cors dotenv helmet morgan compression
npm install express-validator jsonwebtoken bcrypt
npm install nodemon --save-dev
```

Backend scripts:

``` json
"scripts": {
  "dev": "nodemon src/app.js"
}
```

------------------------------------------------------------------------

## Frontend Initialization

``` bash
npm create vite@latest frontend
cd frontend
npm install
npm run dev
```

Select: - React - TypeScript

Install dependencies:

``` bash
npm install axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

------------------------------------------------------------------------

# 3. Folder Structure

------------------------------------------------------------------------

## Backend Structure

    backend/
     ├── src/
     │    ├── routes/
     │    ├── controllers/
     │    ├── services/
     │    ├── middlewares/
     │    ├── validations/
     │    ├── models/
     │    ├── utils/
     │    └── app.js
     │
     ├── .env
     ├── package.json

Rules:

-   Controllers = request/response only
-   Services = business logic
-   Validations = input validation rules
-   Routes = endpoint definitions
-   No business logic inside routes

------------------------------------------------------------------------

## Frontend Structure

    frontend/
     ├── src/
     │    ├── pages/
     │    ├── components/
     │    ├── services/
     │    ├── hooks/
     │    ├── utils/
     │    ├── layouts/
     │    └── App.tsx

Rules:

-   pages = screen-level components
-   components = reusable UI components
-   services = API calls only
-   hooks = logic reuse

------------------------------------------------------------------------

# 4. API Standards

------------------------------------------------------------------------

## REST API Rules

-   Use RESTful naming
-   Use plural resources

Examples:

GET /api/products\
POST /api/products\
PUT /api/products/:id\
DELETE /api/products/:id

------------------------------------------------------------------------

## Response Format (MANDATORY)

Success:

``` json
{
  "success": true,
  "data": {}
}
```

Error:

``` json
{
  "success": false,
  "message": "Error description"
}
```

Validation Error:

``` json
{
  "success": false,
  "message": "Validation error",
  "errors": []
}
```

------------------------------------------------------------------------

# 5. Backend Coding Rules

------------------------------------------------------------------------

## General Rules

-   Use async/await only
-   Never use `.then()`
-   Always wrap controllers with try/catch
-   Controllers must be thin
-   Business logic ONLY in services
-   Validation logic ONLY in validations folder

------------------------------------------------------------------------

## Validation Pattern (MANDATORY)

Use express-validator.

Example:

``` js
import { body } from 'express-validator'

export const createProductValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isNumeric().withMessage('Price must be numeric')
]
```

------------------------------------------------------------------------

## Controller Pattern

``` js
export const createProduct = async (req, res) => {
  try {
    const data = await productService.create(req.body)

    return res.json({
      success: true,
      data
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
```

------------------------------------------------------------------------

## Service Pattern

``` js
export const create = async (payload) => {
  return await Product.create(payload)
}
```

------------------------------------------------------------------------

## Aturan Database & Transaksi (MANDATORY)

-   **Soft Delete Database**: Data tidak boleh dihapus secara permanen. Gunakan fitur *soft delete* dalam database.
-   **Indexing Database**: Tambahkan *indexing* pada kolom database yang sering digunakan untuk pencarian, pengurutan, atau filter.
-   **Race Condition Transaction**: Gunakan mekanisme keamanan database seperti *row-level locking* untuk mencegah terjadinya *race condition* saat operasi penting.
-   **Database Transaction**: Semua operasi mutasi (buat/ubah/hapus) multi-data wajib dibungkus dalam satu transaksi. Sistem wajib memastikan alur proses meliputi:
    -   *Start Transaction* di awal proses
    -   *Commit* data hanya jika semua instruksi berhasil
    -   *Rollback* seluruh data jika ada satu saja instruksi gagal

------------------------------------------------------------------------

# 6. Authentication Rules 🔐

------------------------------------------------------------------------

## Auth Strategy

-   JWT आधारित authentication
-   Access Token required for protected routes
-   Password must be hashed using bcrypt

------------------------------------------------------------------------

## JWT Rules

-   Never store plain password
-   Token verification via middleware
-   Secret key via environment variable

Example Middleware:

``` js
import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
}
```

------------------------------------------------------------------------

# 7. Security Standards 🛡️ (CRITICAL)

------------------------------------------------------------------------

Backend must consider:

✅ Input Validation (express-validator)\
✅ Helmet for HTTP security headers\
✅ Password Hashing (bcrypt)\
✅ JWT Verification\
✅ Rate Limiting (recommended)\
✅ Avoid SQL Injection (use ORM)\
✅ Sanitize User Input\
✅ Never expose stack traces

Forbidden:

🚫 Plain text passwords\
🚫 Trusting client data blindly\
🚫 Sensitive data in responses\
🚫 Hardcoded secrets

------------------------------------------------------------------------

# 8. Performance Standards ⚡

------------------------------------------------------------------------

Backend:

✅ Use pagination for list endpoints\
✅ Avoid N+1 queries\
✅ Use indexes in database\
✅ Use caching (Redis optional)\
✅ Use compression middleware\
✅ Use proper query limits

Frontend:

✅ Avoid unnecessary re-renders\
✅ Use memoization when needed\
✅ Lazy load heavy components\
✅ Optimize API calls

------------------------------------------------------------------------

# 9. Frontend Coding Rules

------------------------------------------------------------------------

## Component Rules

-   Functional components ONLY
-   Arrow functions ONLY
-   One component per file
-   Components must be small & focused
-   No direct API calls inside components

------------------------------------------------------------------------

## State Rules

-   useState for local state
-   useEffect for side effects
-   Handle loading & error state

------------------------------------------------------------------------

## Aturan UI/UX (MANDATORY)

-   **Desain Responsif**: Antarmuka wajib responsif dan dapat menyesuaikan dengan batas resolusi layar berikut:
    -   **Desktop**: ≥1280px
    -   **Tablet / iPad**: 768px – 1279px
    -   **Mobile / HP**: <768px
-   **Tabel Responsif**: Semua informasi berupa tabel wajib responsif di layar kecil (contoh: *horizontal scroll* pada tabel).
-   **Status Tampilan Antarmuka**:
    -   **Loading state**: Tampilkan indikator loading saat proses sedang berjalan (*spinner* / *skeleton*).
    -   **Empty state**: Tampilkan pesan atau visual yang baik ketika daftar atau data bernilai nihil.
    -   **Error state**: Tampilkan peringatan atau error *feedback* saat sistem maupun akses ke *API* terjadi kegagalan/gangguan.
-   **Disable Button During API Call**: Seluruh elemen interaksi berupa tombol wajib dinonaktifkan sementara (*disable button*) selama *API call* berlangsung.
-   **Confirm Destructive Actions**: Wajib memunculkan *error dialog* / konfirmasi persetujuan sebelum mengeksekusi aksi destruktif (contoh: menghapus data).

------------------------------------------------------------------------

# 10. Axios Rules & API Integration (MANDATORY)

------------------------------------------------------------------------

## API Base Instance

Gunakan base instance untuk semua call ke Backend.

``` ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

export default api
```

------------------------------------------------------------------------

## Integrasi Paralel & Mock Data

Karena pengembangan frontend dan backend berjalan secara **paralel**, gunakan **Mock Data berformat JSON** berdasarkan `API_CONTRACT.md` sebelum *endpoint* dari backend riil tersedia.

Gunakan *constant* / variable `USE_MOCK_DATA` (boolean `true` atau `false`) dengan prioritas di tiap file/fungsi *Service Layer* (*folder `services`*). Tujuannya untuk memberikan kemudahan dan kecepatan saat peralihan (*switch*) dari data *mock* (dummy) ke bentuk integrasi API riil dan di set menjadi `false` saat diintegrasikan.

**Contoh Pattern fungsi pada Service API (`USE_MOCK_DATA` vs API riil):**

```ts
import api from './api';
import mockProducts from '../mocks/products.json';

// Set false saat endpoint getProducts riil backend untuk diintegrasikan
const USE_MOCK_DATA_GET_PRODUCTS = true; 

export const getProducts = async () => {
  if (USE_MOCK_DATA_GET_PRODUCTS) {
    // Simulasi respons (contoh pattern success res) dan delay jaringan
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, data: mockProducts }), 500);
    });
  }
  
  // Panggilan ke real backend
  const response = await api.get('/master/products');
  return response.data;
}
```

------------------------------------------------------------------------

# 11. Naming Conventions

------------------------------------------------------------------------

Backend:

-   snake_case for DB columns
-   camelCase for JS variables

Frontend:

-   PascalCase for components
-   camelCase for variables

------------------------------------------------------------------------

# 12. Forbidden Patterns 🚫

------------------------------------------------------------------------

Backend:

🚫 Business logic inside controllers\
🚫 Missing validation\
🚫 Raw SQL in controllers\
🚫 Hardcoded secrets

Frontend:

🚫 API calls directly inside components\
🚫 Inline styles\
🚫 Massive components

------------------------------------------------------------------------

# 13. Debugging Rules

------------------------------------------------------------------------

Backend:

-   Use morgan for logs
-   Use structured logging when needed
-   Never leak sensitive data

Frontend:

-   Use DevTools
-   Check Network tab first

------------------------------------------------------------------------

# 14. AI Behavior Instruction

------------------------------------------------------------------------

AI must:

✅ Follow folder structure\
✅ Use validations layer\
✅ Use JWT auth pattern\
✅ Follow response format\
✅ Apply security best practices\
✅ Consider performance

AI must NOT:

❌ Change stack\
❌ Ignore validation\
❌ Ignore security\
❌ Invent new architecture

------------------------------------------------------------------------

END OF GUIDE
