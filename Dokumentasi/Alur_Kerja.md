# Alur Kerja & Proses Bisnis

Dokumen ini menguraikan tahapan penggunaan sistem dari awal konfigurasi data hingga proses operasional di lapangan.

## 1. Manajemen Master Data

Sebelum sistem dapat digunakan untuk penimbangan produksi, administrator harus mendaftarkan data dasar.

*   **Pendaftaran Bahan Baku (Materials):**
    Akses menu **Bahan Baku**. Tambahkan daftar bahan yang ada di gudang (misal: Tepung Terigu, Gula Putih) beserta *Unit of Measure* (UOM) dasarnya seperti KG atau GRAM. Setiap bahan baku akan memiliki `kode_produk` unik.
*   **Registrasi Perangkat IoT (Devices):**
    Akses menu **Alat Timbangan**. Daftarkan perangkat ESP32 yang digunakan di lapangan. `device_id` yang didaftarkan di sini **harus sama persis** dengan konfigurasi ID di dalam program (C++) ESP32 (contoh: `TIMBANGAN-01`).

## 2. Alur "Mulai Menimbang" (Direct Production)

Alur kerja inti dari proyek ini dirancang agar sangat fleksibel dan berpusat pada sesi alat.

1.  **Pilih Bahan Baku:**
    Operator membuka menu **Mulai Menimbang** dan menekan tombol **+ Buat Sesi Baru**. Operator kemudian memilih bahan baku mana yang akan ditimbang dari daftar *dropdown*.
2.  **Pantauan Real-Time:**
    Setelah sesi dibuat, layar akan menampilkan *Live Weight Display* secara *real-time*. Operator menempatkan bahan baku di atas timbangan fisik.
3.  **Proses Batching Otomatis:**
    Saat target berat sudah sesuai, operator menekan tombol **Timbang & Simpan (Auto Batch)**.
    Sistem akan:
    *   Mengambil nilai berat yang terakhir dilaporkan oleh alat.
    *   Membuat rekam jejak produksi dengan nomor Batch acak/berurutan.
    *   Menghubungkan rekam jejak tersebut dengan Bahan Baku yang dipilih.
4.  **Skenario Fallback (Manual Override):**
    Apabila sensor timbangan mengalami kendala koneksi atau tidak stabil, operator diberi wewenang untuk menekan tombol **(Edit)** pada baris histori, guna melakukan koreksi nilai berat secara manual berdasarkan pembacaan pada layar LCD fisik perangkat.

## 3. Pelaporan Data

Data yang telah tersimpan dapat dipantau di halaman **Dashboard** melalui grafik batang komparatif (*Aktivitas Penimbangan 12 Jam*), serta direkapitulasi secara rinci pada menu **Data Penimbangan** untuk keperluan pelaporan produksi dan audit logistik.
