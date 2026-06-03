# Smart Timbangan IoT - Dokumentasi Proyek

Selamat datang di direktori dokumentasi resmi untuk proyek **Smart Timbangan IoT**. Proyek ini adalah sistem manajemen penimbangan bahan baku terintegrasi yang menghubungkan perangkat keras (timbangan digital berbasis ESP32) dengan platform web (*Dashboard* Admin) secara *real-time*.

## Daftar Isi Dokumentasi

Berikut adalah daftar dokumen teknis yang tersedia di direktori ini:

1. **[Arsitektur Sistem (Arsitektur_Sistem.md)](./Arsitektur_Sistem.md)**
   Menjelaskan struktur teknologi yang digunakan (Frontend Next.js, Backend Laravel 11, WebSockets Laravel Reverb, dan integrasi IoT ESP32).

2. **[Alur Kerja & Bisnis (Alur_Kerja.md)](./Alur_Kerja.md)**
   Panduan lengkap mengenai alur proses produksi, mulai dari manajemen Master Data (Bahan Baku & Perangkat), hingga proses penimbangan secara langsung (*Live Weighing*) dan pencatatan otomatis (*Batching*).

3. **[Panduan Instalasi (Panduan_Instalasi.md)](./Panduan_Instalasi.md)**
   Langkah-langkah terperinci untuk menjalankan proyek ini di mesin lokal (*Local Development*), mulai dari konfigurasi *database*, pengaturan variabel lingkungan (`.env`), hingga menjalankan server secara bersamaan.

4. **[Referensi API (API_Reference.md)](./API_Reference.md)**
   Dokumentasi *endpoint* REST API yang disediakan oleh Backend untuk diakses oleh Frontend maupun perangkat IoT (ESP32).

## Tentang Proyek Ini

**Tujuan Utama:**
Menghilangkan proses pencatatan manual dalam penimbangan bahan baku produksi, mencegah *human-error*, dan memastikan transparansi data berat bahan baku melalui pengiriman data secara *real-time* langsung dari perangkat sensor ke *server* pusat.

**Fitur Unggulan:**
- **Real-Time Monitoring:** Pantau perubahan berat timbangan secara *live* tanpa perlu memuat ulang halaman (*refresh*).
- **Direct Material Selection:** Alur kerja dinamis yang memungkinkan operator memilih bahan baku yang akan ditimbang langsung dari antarmuka penimbangan.
- **Auto-Batching:** Pembuatan kode angkatan (*batch*) dan penyimpanan histori otomatis ke dalam basis data setiap kali penimbangan selesai.
- **Master Data Management:** Sistem CRUD penuh untuk mengelola bahan baku (*Materials*) dan perangkat IoT (*Devices*).
- **Dark Premium UI:** Antarmuka dengan efek *glass-morphism* yang modern, responsif, dan nyaman dipandang dalam durasi kerja yang lama.
