# Arsitektur Sistem

Proyek **Smart Timbangan IoT** menggunakan arsitektur *Client-Server* modern yang didukung oleh konektivitas *WebSocket* untuk komunikasi *real-time*.

## Tumpukan Teknologi (Tech Stack)

### 1. Frontend (Antarmuka Pengguna)
- **Framework:** Next.js 14 (App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS & Shadcn UI
- **Visualisasi Data:** Recharts
- **Konektivitas WebSocket:** Laravel Echo & Pusher-js

### 2. Backend (API & WebSocket Server)
- **Framework:** Laravel 11
- **Bahasa:** PHP 8.2+
- **Database:** MySQL
- **WebSocket Server:** Laravel Reverb (Bawaan ekosistem Laravel 11 untuk integrasi WebSocket yang cepat dan efisien tanpa bergantung pada layanan pihak ketiga).

### 3. Perangkat Keras (IoT Edge)
- **Microcontroller:** ESP32
- **Sensor:** Load Cell + Modul HX711 (Penguat sinyal analog ke digital)
- **Konektivitas:** Modul Wi-Fi terintegrasi untuk komunikasi HTTP POST ke Backend API.

## Diagram Topologi & Aliran Data

1. **Sensor ke Backend (IoT Flow):**
   * Perangkat ESP32 membaca berat dari sensor *Load Cell*.
   * ESP32 mengirimkan HTTP POST request berisi `device_id` dan `weight` ke *endpoint* API Laravel (`/api/sensor/weight`).
2. **Backend ke Frontend (Real-Time Flow):**
   * Laravel menerima data berat dan memvalidasinya.
   * Laravel menggunakan *Laravel Reverb* untuk menyiarkan (*broadcast*) *event* WebSocket bernama `WeightReceived` ke *channel* publik (`scale.{device_id}`).
3. **Frontend ke User (UI/UX Flow):**
   * Aplikasi Next.js mendengarkan (*listen*) *channel* tersebut menggunakan *Laravel Echo*.
   * Saat data baru tiba, *state* React diperbarui dan angka di *Dashboard* berkedip, menyajikan hasil penimbangan dalam waktu sepersekian detik secara instan.
4. **Data Persistence (Database Flow):**
   * Saat operator menekan tombol "Simpan & Selesai" pada antarmuka *Frontend*, Next.js mengirimkan permintaan POST ke API Laravel.
   * Laravel menyimpan data histori penimbangan (`ProductionCosting`) lengkap dengan kode *Batch* dan ID Bahan Baku ke dalam *database* MySQL.
