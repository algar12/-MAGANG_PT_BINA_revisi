# Panduan & Skema Wiring Hybrid (Timbangan FORTERA + ESP32)

Dokumen ini berisi panduan lengkap tentang bagaimana menyambungkan timbangan komersial digital (seperti FORTERA 500kg) agar dapat memunculkan angka di layar bawaan pabrik **sekaligus** mengirimkan data ke sistem IoT ESP32 secara bersamaan (*Hybrid*).

---

![Ilustrasi Wiring Hybrid](./images/hybrid_wiring_png_clear.png)

## 1. Diagram Skema Kabel (Wiring Diagram)

Berikut adalah ilustrasi penyambungan kabel (*tapping* / pencabangan) menggunakan format diagram. Garis tebal adalah kabel asli pabrik, sedangkan garis putus-putus adalah kabel tambahan yang Anda sambungkan ke modul HX711.

```mermaid
flowchart TD
    %% Komponen Utama
    LC[Sensor Load Cell Bawah Timbangan]
    IND[Layar Indikator Bawaan FORTERA]
    HX[Modul Analog HX711]
    ESP[Modul Microcontroller ESP32]

    %% Kabel Utama Pabrik (Tetap Tersambung Sepenuhnya)
    LC ==>|Kabel Merah Excitation Plus| IND
    LC ==>|Kabel Hitam Excitation Min| IND
    LC ==>|Kabel Hijau Signal Plus| IND
    LC ==>|Kabel Putih Signal Min| IND

    %% Kabel Suntikan (Tapping / Cabang)
    LC -.->|Cabang Kabel Hitam| HX_EMIN[Pin E- di HX711]
    LC -.->|Cabang Kabel Hijau| HX_APLUS[Pin A+ di HX711]
    LC -.->|Cabang Kabel Putih| HX_AMIN[Pin A- di HX711]

    %% Koneksi HX711 internal node (Hanya visual diagram)
    HX_EMIN --- HX
    HX_APLUS --- HX
    HX_AMIN --- HX
    
    %% Peringatan Keras
    HX_EPLUS[Pin E+ di HX711] -.->|WAJIB DIBIARKAN KOSONG| WARNING[JANGAN DISAMBUNG KE KABEL MERAH]
    HX_EPLUS --- HX

    %% Sambungan HX711 ke ESP32
    HX -->|Kabel dari Pin DOUT| ESP_16[Pin GPIO 16 di ESP32]
    HX -->|Kabel dari Pin SCK| ESP_4[Pin GPIO 4 di ESP32]
    HX -->|Kabel VCC dan GND| ESP_PWR[Pin 3.3V dan GND di ESP32]
    
    ESP_16 --- ESP
    ESP_4 --- ESP
    ESP_PWR --- ESP
```

---

## 2. Langkah-Langkah Pengerjaan (Step-by-Step)

### A. Persiapan Kabel Sensor
1. Buka leher/tiang penyangga layar timbangan FORTERA atau urutkan kabel tebal yang berasal dari pelat bawah timbangan menuju ke layar atas.
2. Temukan bagian kabel yang bisa dikupas pelindung luarnya (karet tebalnya) tanpa memotong kabel kawat di dalamnya.
3. Anda akan melihat 4 kabel kecil berwarna: **Merah, Hitam, Hijau, Putih**.

### B. Proses Suntik / Cabang Kabel (Tapping)
Gunakan silet atau *wire stripper* untuk mengupas sedikit saja (sekitar 0.5 cm) kulit luar kabel **Hitam, Hijau, dan Putih**. 
> **Peringatan:** Biarkan kabel **Merah** utuh! Jangan dikupas, dan jangan dicabang. Kabel merah ini menyalurkan listrik dari FORTERA ke sensor.

Sambungkan kabel *jumper* (kabel tambahan) ke bagian yang telah dikupas tadi, lalu solasi/bungkus dengan selotip bakar agar tidak korslet.
1. Sambungkan ujung kabel *jumper* dari kabel **Hijau** ➔ ke lubang pin **A+** pada HX711.
2. Sambungkan ujung kabel *jumper* dari kabel **Putih** ➔ ke lubang pin **A-** pada HX711.
3. Sambungkan ujung kabel *jumper* dari kabel **Hitam** ➔ ke lubang pin **E-** (GND) pada HX711.
4. Pastikan lubang pin **E+** pada HX711 benar-benar **KOSONG**.

### C. Sambungan HX711 ke ESP32
Sesuai dengan kode *firmware* `main.cpp` yang telah dibuat, sambungkan HX711 ke ESP32 Anda:
- Pin **VCC** HX711 ➔ ke Pin **3V3** (3.3V) ESP32
- Pin **GND** HX711 ➔ ke Pin **GND** ESP32
- Pin **DT / DOUT** HX711 ➔ ke Pin **D16 / GPIO 16** ESP32
- Pin **SCK** HX711 ➔ ke Pin **D4 / GPIO 4** ESP32

---

## 3. Syarat Sistem Hybrid Berjalan
1. **Layar Utama Wajib ON:** Karena kabel Merah (sumber daya sensor) hanya dialiri listrik oleh mesin timbangan FORTERA, maka modul ESP32 baru bisa membaca berat **HANYA JIKA** layar FORTERA dihidupkan (ON).
2. **Ulangi Proses Kalibrasi di ESP32:** Menambahkan kabel bercabang akan memberikan nilai hambatan (*resistance*) tambahan yang sangat kecil. Walaupun kecil, hal ini mengubah nilai pembacaan analog. Oleh karena itu, Anda harus mengkalibrasi ulang nilai `CALIBRATION_FACTOR` di kode `main.cpp` ESP32 Anda agar angkanya cocok dengan layar FORTERA.
