# API Reference

Berikut adalah spesifikasi antarmuka pemrograman aplikasi (API) yang tersedia di sistem Backend Laravel.

Semua request dan response menggunakan format `application/json`.
Base URL: `http://localhost:8000/api`

---

## 1. IoT Sensor Integration

### `POST /sensor/weight`
Endpoint ini digunakan secara eksklusif oleh perangkat ESP32 untuk melaporkan berat benda secara kontinu ke server. Endpoint ini akan men-*trigger* WebSocket Broadcaster (`WeightReceived`).

**Request Payload:**
```json
{
  "device_id": "TIMBANGAN-01",
  "weight": 14.5
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Berat diterima dan disiarkan",
  "device": "TIMBANGAN-01",
  "weight": 14.5
}
```

---

## 2. Production & Weighing

### `POST /production`
Menyimpan sesi penimbangan atau *Batch* baru ke dalam *database* dan menghubungkannya dengan ID bahan baku.

**Request Payload:**
```json
{
  "material_id": 3,
  "device_id": "TIMBANGAN-01",
  "target_weight": 0,
  "actual_weight": 14.5,
  "costing_status": "DRAFT",
  "notes": "Penimbangan sore hari"
}
```

### `PUT /production/{id}/weight`
Melakukan *override* atau penyuntingan secara manual atas berat yang sebelumnya telah dicatat oleh sistem IoT.

**Request Payload:**
```json
{
  "actual_weight": 15.2
}
```

---

## 3. Master Data Management

Sistem ini menggunakan *Resource Routes* standar Laravel untuk mengelola CRUD master data. Seluruh *endpoint* berikut mematuhi struktur RESTful:

### Materials (Bahan Baku)
- `GET /materials` - Mengambil semua bahan baku.
- `POST /materials` - Menambahkan bahan baku baru.
- `GET /materials/{id}` - Menampilkan detail satu bahan baku.
- `PUT /materials/{id}` - Memperbarui data bahan baku.
- `DELETE /materials/{id}` - Menghapus data bahan baku.

### Devices (Perangkat)
- `GET /devices` - Mengambil semua *device* terdaftar.
- `POST /devices` - Mendaftarkan *device* ESP32 baru.
- `PUT /devices/{id}` - Memperbarui status / keterangan *device*.
- `DELETE /devices/{id}` - Menghapus *device*.
