# 🌙 JHC HalalFlow

> Sistem manajemen produk halal berbasis web untuk **Jamaah Haji Cilegon (JHC)** — memudahkan pengelolaan inventaris, verifikasi kehalalan, dan pelaporan secara terpusat.

---

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Akses Aplikasi](#akses-aplikasi)
- [Skrip yang Tersedia](#skrip-yang-tersedia)

---

## 📖 Tentang Proyek

**JHC HalalFlow** adalah platform manajemen produk halal yang dirancang khusus untuk Jamaah Haji Cilegon. Sistem ini menyediakan antarmuka yang mudah digunakan bagi pengguna umum dan panel administrasi yang lengkap bagi pengelola organisasi.

---

## ✨ Fitur Utama

### 👤 Aplikasi Pengguna (User App)
- Pencarian dan pengecekan status kehalalan produk
- Tampilan katalog produk dengan informasi detail
- Ekspor data ke format Excel (`.xlsx`)
- Autentikasi pengguna dengan JWT

### 🛠️ Panel Admin (Admin App)
- Manajemen inventaris produk halal
- Pengelolaan data pengguna
- Notifikasi via email (SMTP)
- Laporan dan ekspor data
- Dashboard statistik

### ⚙️ Backend API
- REST API berbasis Express.js
- Database SQLite dengan `better-sqlite3`
- Autentikasi JWT untuk pengguna & admin
- Upload file dengan Multer
- Pengiriman email dengan Nodemailer

---

## 🛠️ Teknologi yang Digunakan

| Layer | Teknologi |
|---|---|
| **Frontend (User)** | React 19, React Router DOM, TailwindCSS 4, Vite 8 |
| **Frontend (Admin)** | React 19, TailwindCSS 4, Vite 8 |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (`better-sqlite3`) |
| **Autentikasi** | JSON Web Token (JWT), bcryptjs |
| **Email** | Nodemailer (SMTP Gmail) |
| **Export** | xlsx |
| **Testing** | Playwright |

---

## 📁 Struktur Proyek

```
project-halalflow/
├── backend/                   # Backend API (Express.js)
│   ├── server.js              # Entry point server
│   ├── database.js            # Konfigurasi & skema database
│   ├── db.js                  # Helper query database
│   ├── migrate.js             # Skrip migrasi database
│   ├── generate-templates.js  # Generator template
│   ├── reset-user-password.js # Utilitas reset password
│   ├── uploads/               # Direktori file upload
│   ├── halalflow.db           # File database SQLite
│   └── .env                   # Konfigurasi environment
│
├── frontend/                  # Aplikasi pengguna (React + Vite)
│   ├── src/
│   │   ├── App.jsx            # Root component & routing
│   │   ├── UserApp.jsx        # Komponen utama pengguna
│   │   ├── AdminApp.jsx       # Komponen panel admin
│   │   └── main.jsx           # Entry point React
│   └── index.html
│
├── admin-frontend/            # Panel admin terpisah (React + Vite)
│   ├── src/
│   │   ├── App.jsx            # Komponen utama admin
│   │   └── main.jsx           # Entry point React
│   └── index.html
│
├── screenshots/               # Screenshot aplikasi
├── test/                      # Pengujian E2E (Playwright)
├── start-all.bat              # Skrip starter (Windows CMD)
├── start-all.ps1              # Skrip starter (PowerShell)
└── package.json
```

---

## ✅ Prasyarat

Pastikan sudah terinstal di sistem Anda:

- **Node.js** versi 18 atau lebih baru → [nodejs.org](https://nodejs.org)
- **npm** (sudah termasuk bersama Node.js)

---

## 🚀 Instalasi

### 1. Clone Repositori

```bash
git clone https://github.com/MuhammadAkmalSyarif/JHC-halalflow.git
cd JHC-halalflow
```

### 2. Install Dependensi Backend

```bash
cd backend
npm install
cd ..
```

### 3. Install Dependensi Frontend (User App)

```bash
cd frontend
npm install
cd ..
```

### 4. Install Dependensi Admin Frontend *(opsional jika dipakai terpisah)*

```bash
cd admin-frontend
npm install
cd ..
```

---

## ⚙️ Konfigurasi

Buat atau edit file `.env` di dalam folder `backend/`:

```env
# Server
PORT=5000

# JWT User
JWT_SECRET=jhc_halalflow_jwt_secret_2026_secure
JWT_EXPIRES_IN=7d

# JWT Admin
ADMIN_JWT_SECRET=jhc_admin_jwt_secret_2026_secure
ADMIN_JWT_EXPIRES_IN=12h

# Akun Admin Default
ADMIN_DEFAULT_EMAIL=admin@jhc.or.id
ADMIN_DEFAULT_PASSWORD=JHC_Admin_2026!
ADMIN_DEFAULT_NAME=JHC Administrator

# Konfigurasi Email SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="JHC HalalFlow <your-email@gmail.com>"
```

> **⚠️ Penting:** Jangan commit file `.env` ke repositori publik. Pastikan `.env` sudah terdaftar di `.gitignore`.

---

## ▶️ Menjalankan Aplikasi

### Cara 1 — Menggunakan Skrip Otomatis (Direkomendasikan)

**Windows CMD:**
```bat
start-all.bat
```

**PowerShell:**
```powershell
.\start-all.ps1
```

Skrip ini akan secara otomatis menjalankan backend dan frontend secara bersamaan, lalu membuka browser ke `http://localhost:5173`.

---

### Cara 2 — Menjalankan Manual (Per Terminal)

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```

**Terminal 2 — Frontend (User + Admin):**
```bash
cd frontend
npm run dev
```

---

## 🌐 Akses Aplikasi

| Layanan | URL |
|---|---|
| **Aplikasi Pengguna** | http://localhost:5173 |
| **Panel Admin** | http://localhost:5173/admin |
| **Backend API** | http://localhost:5000 |

### Login Admin Default

| Field | Value |
|---|---|
| Email | `admin@jhc.or.id` |
| Password | `JHC_Admin_2026!` |

> **⚠️ Segera ganti password default setelah login pertama.**

---

## 📜 Skrip yang Tersedia

### Backend (`/backend`)

| Perintah | Deskripsi |
|---|---|
| `npm start` | Menjalankan server produksi |
| `node migrate.js` | Menjalankan migrasi database |
| `node reset-user-password.js` | Reset password pengguna |

### Frontend (`/frontend` & `/admin-frontend`)

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan server development |
| `npm run build` | Build untuk produksi |
| `npm run preview` | Preview hasil build |
| `npm run lint` | Menjalankan linter (oxlint) |

---

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan internal **Jamaah Haji Cilegon (JHC)**.

---

<p align="center">
  Dibuat dengan ❤️ untuk JHC &mdash; Jamaah Haji Cilegon
</p>
