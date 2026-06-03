# Panduan Instalasi dan Pengembangan (Setup Guide)

Dokumen ini berisi panduan teknis langkah demi langkah untuk menjalankan *environment* aplikasi secara keseluruhan.

## Persyaratan Sistem
- Node.js (v18 atau lebih baru)
- PHP (v8.2 atau lebih baru)
- Composer
- MySQL Server (XAMPP, Laragon, dsb.)

---

## 1. Persiapan Backend (Laravel)

1. **Buka Terminal** dan arahkan ke dalam direktori `backend`:
   ```bash
   cd backend
   ```
2. **Install Dependensi**:
   ```bash
   composer install
   ```
3. **Konfigurasi Lingkungan (.env)**:
   Salin berkas `.env.example` ke `.env` dan pastikan konfigurasi basis data telah disesuaikan:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=smart_timbangan
   DB_USERNAME=root
   DB_PASSWORD=
   
   BROADCAST_CONNECTION=reverb
   
   REVERB_APP_ID=173747
   REVERB_APP_KEY=5e3qbof0fhnxdvksf2p9
   REVERB_APP_SECRET=euoncxkm0f6frmc9rohs
   REVERB_HOST="localhost"
   REVERB_PORT=8080
   REVERB_SCHEME=http
   ```
4. **Migrasi Database**:
   ```bash
   php artisan migrate:fresh --seed
   ```
5. **Jalankan Aplikasi API & Server WebSocket**:
   Buka **dua terminal terpisah** di direktori `backend`:
   *Terminal Pertama (Menjalankan API HTTP):*
   ```bash
   php artisan serve
   ```
   *Terminal Kedua (Menjalankan Server WebSockets Reverb):*
   ```bash
   php artisan reverb:start
   ```

---

## 2. Persiapan Frontend (Next.js)

1. **Buka Terminal Baru** dan arahkan ke dalam direktori `frontend`:
   ```bash
   cd frontend
   ```
2. **Install Dependensi**:
   ```bash
   npm install
   ```
3. **Konfigurasi Lingkungan (.env.local)**:
   Buat atau ubah berkas `.env.local` dan pastikan kuncinya cocok (*match*) dengan milik backend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_REVERB_APP_KEY=5e3qbof0fhnxdvksf2p9
   NEXT_PUBLIC_REVERB_HOST=localhost
   NEXT_PUBLIC_REVERB_PORT=8080
   NEXT_PUBLIC_REVERB_SCHEME=http
   ```
4. **Jalankan Aplikasi Web**:
   ```bash
   npm run dev
   ```
5. **Akses Dashboard**:
   Buka peramban (*browser*) Anda dan navigasi ke: `http://localhost:3000/dashboard`

---

## 3. Simulasi Alat / Pengujian Tanpa Perangkat ESP32

Jika Anda sedang mengembangkan web tanpa terhubung ke perangkat keras timbangan, Anda dapat mengirimkan perintah POST (layaknya perangkat fisik) menggunakan terminal, `curl`, atau aplikasi seperti Postman:

```powershell
curl.exe -X POST http://localhost:8000/api/sensor/weight -H "Content-Type: application/json" -H "Accept: application/json" -d "{\"device_id\":\"TIMBANGAN-01\",\"weight\":188.5}"
```
Angka pada halaman *Live Weighing* akan seketika berubah.
