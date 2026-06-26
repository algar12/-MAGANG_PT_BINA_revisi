# 🔌 Panduan Implementasi Protokol MQTT pada Smart Timbangan IoT

## Daftar Isi

1. [Apa itu MQTT?](#1-apa-itu-mqtt)
2. [Arsitektur Saat Ini vs Arsitektur MQTT](#2-arsitektur-saat-ini-vs-arsitektur-mqtt)
3. [Apa yang Harus Disiapkan](#3-apa-yang-harus-disiapkan)
4. [Instalasi & Konfigurasi Broker MQTT (Mosquitto)](#4-instalasi--konfigurasi-broker-mqtt-mosquitto)
5. [Perubahan Kode ESP32 (IoT)](#5-perubahan-kode-esp32-iot)
6. [Perubahan Kode Laravel Backend](#6-perubahan-kode-laravel-backend)
7. [Perubahan Kode Frontend Next.js (Opsional)](#7-perubahan-kode-frontend-nextjs-opsional)
8. [Konfigurasi Environment](#8-konfigurasi-environment)
9. [Testing & Debugging](#9-testing--debugging)
10. [Perbandingan HTTP vs MQTT](#10-perbandingan-http-vs-mqtt)
11. [Kesimpulan & Rekomendasi](#11-kesimpulan--rekomendasi)

---

## 1. Apa itu MQTT?

**MQTT (Message Queuing Telemetry Transport)** adalah protokol komunikasi ringan berbasis **publish/subscribe** yang dirancang khusus untuk perangkat IoT dengan resource terbatas dan jaringan tidak stabil.

### Konsep Utama:

| Komponen       | Penjelasan                                                              |
| -------------- | ----------------------------------------------------------------------- |
| **Broker**     | Server pusat yang menerima dan mendistribusikan pesan (seperti kantor pos) |
| **Publisher**  | Perangkat yang mengirim data ke broker (ESP32 kamu)                     |
| **Subscriber** | Perangkat/aplikasi yang menerima data dari broker (Laravel backend)     |
| **Topic**      | "Alamat" pesan, seperti `smart-timbangan/TIMBANGAN-01/weight`           |
| **QoS**        | Level jaminan pengiriman (0 = sekali kirim, 1 = minimal sekali, 2 = tepat sekali) |

### Kenapa MQTT cocok untuk project ini?

- **Ringan** — Header pesan hanya 2 byte (vs HTTP yang ratusan byte per request)
- **Real-time** — Koneksi persisten, data langsung sampai tanpa polling
- **Hemat daya** — ESP32 tidak perlu buka-tutup koneksi HTTP berulang kali
- **Reliable** — Ada mekanisme QoS & Last Will Testament (perangkat offline terdeteksi)

---

## 2. Arsitektur Saat Ini vs Arsitektur MQTT

### Arsitektur Saat Ini (HTTP POST)

```
ESP32 --[HTTP POST setiap 1 detik]--> Laravel API (/api/sensor/weight)
                                          |
                                          +--> broadcast(WeightReceived) via Reverb
                                          |
                                     Next.js Frontend (via WebSocket/Reverb)
```

**Masalah:**
- Setiap 1 detik, ESP32 membuat koneksi HTTP baru → overhead besar
- Jika server down, data hilang tanpa notifikasi
- Tidak bisa mendeteksi apakah ESP32 masih online/offline

### Arsitektur Baru (MQTT)

```
ESP32 --[MQTT Publish]--> Mosquitto Broker <--[MQTT Subscribe]-- Laravel Backend
                              |                                        |
                              |                                   broadcast(WeightReceived)
                              |                                   via Reverb (tetap sama)
                              |                                        |
                              |                                   Next.js Frontend
                              |                                   (tidak berubah)
                              |
                         (Optional: Node.js subscriber terpisah)
```

**Keuntungan:**
- ESP32 hanya buka 1 koneksi persisten ke broker
- Broker menangani distribusi ke semua subscriber
- Last Will Testament → Laravel tahu kapan ESP32 offline
- Frontend **tidak perlu berubah** (tetap menerima data via Reverb)

---

## 3. Apa yang Harus Disiapkan

### A. Software yang Perlu Diinstall

| No | Software                  | Fungsi                       | Install di              |
| -- | ------------------------- | ---------------------------- | ----------------------- |
| 1  | **Mosquitto**             | MQTT Broker                  | Server/PC kamu          |
| 2  | **Library PubSubClient**  | Library MQTT untuk ESP32     | PlatformIO (iot/)       |
| 3  | **php-mqtt/client**       | Library MQTT untuk Laravel   | Backend (composer)      |

### B. Kebutuhan Jaringan

- Broker Mosquitto berjalan di **port 1883** (tanpa TLS) atau **port 8883** (dengan TLS)
- ESP32 dan server Laravel harus bisa mengakses Mosquitto broker
- Jika menggunakan Cloudflare Tunnel, MQTT **tidak bisa** melalui tunnel HTTP — perlu koneksi langsung atau tunnel TCP khusus

### C. Struktur Topic MQTT yang Direkomendasikan

```
smart-timbangan/                          ← Root topic
├── {device_id}/
│   ├── weight          ← Data berat (publish oleh ESP32)
│   ├── status          ← Online/offline (Last Will)
│   └── command         ← Perintah ke ESP32 (tare, calibrate, dll)
```

Contoh topic lengkap:
- `smart-timbangan/TIMBANGAN-01/weight` → `{"weight": 2.35, "unit": "KG"}`
- `smart-timbangan/TIMBANGAN-01/status` → `"online"` atau `"offline"`
- `smart-timbangan/TIMBANGAN-01/command` → `{"action": "tare"}`

---

## 4. Instalasi & Konfigurasi Broker MQTT (Mosquitto)

### Instalasi di Windows

1. Download Mosquitto dari: https://mosquitto.org/download/
2. Install dengan opsi default
3. Edit file konfigurasi `mosquitto.conf`:

```conf
# C:\Program Files\mosquitto\mosquitto.conf

# Listener pada port 1883 untuk semua interface
listener 1883 0.0.0.0

# Izinkan koneksi tanpa autentikasi (development only!)
allow_anonymous true

# Logging
log_dest file C:\Program Files\mosquitto\log\mosquitto.log
log_type all
```

4. Jalankan Mosquitto sebagai service:

```powershell
# Start service
net start mosquitto

# Atau jalankan manual
& "C:\Program Files\mosquitto\mosquitto.exe" -c "C:\Program Files\mosquitto\mosquitto.conf" -v
```

### Menambahkan Autentikasi (Rekomendasi untuk Produksi)

```powershell
# Buat file password
cd "C:\Program Files\mosquitto"
.\mosquitto_passwd.exe -c .\passwd.txt mqtt_user
# Ketik password saat diminta
```

Tambahkan ke `mosquitto.conf`:
```conf
allow_anonymous false
password_file C:\Program Files\mosquitto\passwd.txt
```

### Verifikasi Broker Berjalan

Buka 2 terminal PowerShell:

```powershell
# Terminal 1 - Subscribe
& "C:\Program Files\mosquitto\mosquitto_sub.exe" -h localhost -t "test/topic" -v

# Terminal 2 - Publish
& "C:\Program Files\mosquitto\mosquitto_pub.exe" -h localhost -t "test/topic" -m "Hello MQTT!"
```

Jika Terminal 1 menampilkan `test/topic Hello MQTT!`, broker berjalan dengan benar ✅

---

## 5. Perubahan Kode ESP32 (IoT)

### 5.1 Install Library PubSubClient

Tambahkan ke `iot/platformio.ini`:

```ini
lib_deps =
    knolleary/PubSubClient@^2.8
    bogde/HX711@^0.7.5
    bblanchon/ArduinoJson@^7.0.0
```

### 5.2 Kode ESP32 dengan MQTT (`iot/src/main.cpp`)

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "HX711.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

// ==========================================
// KONFIGURASI WIFI
// ==========================================
const char* ssid = "OPPO A17K";
const char* password = "";

// ==========================================
// KONFIGURASI MQTT BROKER
// ==========================================
const char* mqttServer = "192.168.1.11";   // IP komputer yang menjalankan Mosquitto
const int   mqttPort = 1883;
const char* mqttUser = "";                  // Kosongkan jika allow_anonymous true
const char* mqttPass = "";
const char* deviceId = "TIMBANGAN-01";

// Topic MQTT
String topicWeight;    // akan di-set di setup()
String topicStatus;
String topicCommand;

// ==========================================
// KONFIGURASI PIN & SENSOR HX711
// ==========================================
const int LOADCELL_DOUT_PIN = 4;
const int LOADCELL_SCK_PIN = 5;
HX711 scale;
const float CALIBRATION_FACTOR = 2280.f;

// Interval pengiriman data (ms)
const unsigned long SEND_INTERVAL = 1000;
unsigned long lastSendTime = 0;

// MQTT & WiFi Client
WiFiClient espClient;
PubSubClient mqtt(espClient);

// ==========================================
// FUNGSI: Koneksi WiFi
// ==========================================
void setupWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Menghubungkan ke Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Terhubung! IP: ");
  Serial.println(WiFi.localIP());
}

// ==========================================
// FUNGSI: Callback saat menerima pesan MQTT
// ==========================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("Pesan diterima [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  // Handle command dari server
  if (String(topic) == topicCommand) {
    JsonDocument doc;
    deserializeJson(doc, message);
    String action = doc["action"].as<String>();

    if (action == "tare") {
      scale.tare();
      Serial.println(">> Timbangan di-tare via MQTT!");
    } else if (action == "calibrate") {
      float factor = doc["factor"].as<float>();
      scale.set_scale(factor);
      Serial.println(">> Kalibrasi diubah via MQTT!");
    }
  }
}

// ==========================================
// FUNGSI: Koneksi/Reconnect MQTT
// ==========================================
void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("Menghubungkan ke MQTT Broker...");

    // ClientID unik, Last Will Testament pada topic status
    String clientId = "ESP32-" + String(deviceId);
    bool connected;

    if (strlen(mqttUser) > 0) {
      connected = mqtt.connect(
        clientId.c_str(),
        mqttUser, mqttPass,
        topicStatus.c_str(), 1, true, "offline"  // Last Will
      );
    } else {
      connected = mqtt.connect(
        clientId.c_str(),
        NULL, NULL,
        topicStatus.c_str(), 1, true, "offline"  // Last Will
      );
    }

    if (connected) {
      Serial.println(" Terhubung!");

      // Publish status online (retained)
      mqtt.publish(topicStatus.c_str(), "online", true);

      // Subscribe ke topic command
      mqtt.subscribe(topicCommand.c_str());
      Serial.println("Subscribed ke: " + topicCommand);
    } else {
      Serial.print(" Gagal, rc=");
      Serial.print(mqtt.state());
      Serial.println(" Coba lagi dalam 5 detik...");
      delay(5000);
    }
  }
}

// ==========================================
// SETUP
// ==========================================
void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  Serial.begin(115200);
  Serial.println("Memulai sistem Smart Timbangan IoT (MQTT)...");

  // Set topic berdasarkan device ID
  topicWeight  = "smart-timbangan/" + String(deviceId) + "/weight";
  topicStatus  = "smart-timbangan/" + String(deviceId) + "/status";
  topicCommand = "smart-timbangan/" + String(deviceId) + "/command";

  // Koneksi WiFi
  setupWiFi();

  // Setup MQTT
  mqtt.setServer(mqttServer, mqttPort);
  mqtt.setCallback(mqttCallback);
  mqtt.setBufferSize(512);
  connectMQTT();

  // Inisialisasi Sensor HX711
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(CALIBRATION_FACTOR);
  scale.tare();
  Serial.println("Sensor siap. Timbangan telah di-tare (0 kg).");
}

// ==========================================
// LOOP
// ==========================================
void loop() {
  // Pastikan koneksi MQTT tetap aktif
  if (!mqtt.connected()) {
    connectMQTT();
  }
  mqtt.loop();  // WAJIB dipanggil agar MQTT tetap hidup

  // Kirim data berat secara berkala
  if (millis() - lastSendTime > SEND_INTERVAL) {
    if (scale.is_ready()) {
      float currentWeight = scale.get_units(5);
      if (currentWeight < 0 && currentWeight > -0.05) {
        currentWeight = 0.0;
      }

      Serial.print("Berat: ");
      Serial.print(currentWeight);
      Serial.println(" kg");

      // Buat JSON payload
      JsonDocument doc;
      doc["device_id"] = deviceId;
      doc["weight"] = round(currentWeight * 100.0) / 100.0;
      doc["unit"] = "KG";
      doc["timestamp"] = millis();

      String payload;
      serializeJson(doc, payload);

      // Publish ke MQTT broker
      bool published = mqtt.publish(topicWeight.c_str(), payload.c_str());
      Serial.println(published ? ">> MQTT Published OK" : ">> MQTT Publish GAGAL");
    } else {
      Serial.println("HX711 tidak merespon.");
    }
    lastSendTime = millis();
  }
}
```

**Perbedaan utama dari kode HTTP lama:**
- ❌ Tidak ada lagi `HTTPClient` — tidak buka-tutup koneksi setiap detik
- ✅ `mqtt.loop()` menjaga koneksi tetap hidup (persistent connection)
- ✅ `Last Will Testament` — broker otomatis publish "offline" jika ESP32 mati
- ✅ `Subscribe command` — bisa kirim perintah tare/calibrate dari server

---

## 6. Perubahan Kode Laravel Backend

### 6.1 Install Package MQTT

```bash
cd backend
composer require php-mqtt/client
```

### 6.2 Buat File Konfigurasi MQTT

Buat file `backend/config/mqtt.php`:

```php
<?php

return [
    'host'      => env('MQTT_HOST', '127.0.0.1'),
    'port'      => (int) env('MQTT_PORT', 1883),
    'username'  => env('MQTT_USERNAME', ''),
    'password'  => env('MQTT_PASSWORD', ''),
    'client_id' => env('MQTT_CLIENT_ID', 'laravel-backend'),
];
```

### 6.3 Buat Artisan Command sebagai MQTT Subscriber

Buat file `backend/app/Console/Commands/MqttSubscriber.php`:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;
use App\Models\Device;
use App\Models\ProductionCosting;
use App\Events\WeightReceived;
use App\Events\CostingUpdated;

class MqttSubscriber extends Command
{
    protected $signature = 'mqtt:subscribe';
    protected $description = 'Subscribe ke MQTT broker dan proses data timbangan';

    public function handle()
    {
        $this->info('🔌 Menghubungkan ke MQTT Broker...');

        $mqtt = new MqttClient(
            config('mqtt.host'),
            config('mqtt.port'),
            config('mqtt.client_id')
        );

        $settings = (new ConnectionSettings)
            ->setKeepAliveInterval(60)
            ->setLastWillTopic('laravel/status')
            ->setLastWillMessage('offline')
            ->setLastWillQualityOfService(1);

        if (config('mqtt.username')) {
            $settings->setUsername(config('mqtt.username'))
                     ->setPassword(config('mqtt.password'));
        }

        $mqtt->connect($settings, true);
        $this->info('✅ Terhubung ke MQTT Broker: ' . config('mqtt.host'));

        // Subscribe ke semua topic weight (wildcard +)
        $mqtt->subscribe(
            'smart-timbangan/+/weight',
            function (string $topic, string $message) {
                $this->processWeight($topic, $message);
            },
            MqttClient::QOS_AT_LEAST_ONCE
        );

        // Subscribe ke semua topic status
        $mqtt->subscribe(
            'smart-timbangan/+/status',
            function (string $topic, string $message) {
                $this->processStatus($topic, $message);
            },
            MqttClient::QOS_AT_LEAST_ONCE
        );

        $this->info('📡 Listening... (Ctrl+C untuk stop)');
        $mqtt->loop(true);  // Blocking loop — terus berjalan
    }

    private function processWeight(string $topic, string $message): void
    {
        $data = json_decode($message, true);
        if (!$data || !isset($data['device_id'], $data['weight'])) {
            $this->warn("⚠ Payload tidak valid: {$message}");
            return;
        }

        $deviceId = $data['device_id'];
        $weight   = (float) $data['weight'];

        $this->line("⚖ [{$deviceId}] Berat: {$weight} KG");

        $device = Device::where('device_id', $deviceId)->first();
        if (!$device) {
            $this->error("❌ Device {$deviceId} tidak ditemukan di database!");
            return;
        }

        // Broadcast ke frontend via Reverb (sama seperti sebelumnya)
        broadcast(new WeightReceived(
            device_id: $device->device_id,
            device_name: $device->name,
            weight: $weight,
        ));

        // Proses costing yang pending
        $costing = ProductionCosting::where('device_id', $device->id)
            ->where('status', 'Pending')
            ->first();

        if ($costing) {
            $costing->update([
                'netto_produksi' => $weight,
                'sub_cost_price' => $weight * $costing->price_bom,
                'status' => 'Weighed',
            ]);
            broadcast(new CostingUpdated($costing->order_id));
            $this->info("📦 Costing #{$costing->id} diperbarui!");
        }
    }

    private function processStatus(string $topic, string $message): void
    {
        preg_match('/smart-timbangan\/(.+)\/status/', $topic, $matches);
        $deviceId = $matches[1] ?? 'unknown';
        $status = trim($message);

        if ($status === 'online') {
            $this->info("🟢 Device {$deviceId} ONLINE");
        } else {
            $this->warn("🔴 Device {$deviceId} OFFLINE");
        }

        // Update status di database
        Device::where('device_id', $deviceId)->update([
            'is_active' => $status === 'online',
        ]);
    }
}
```

### 6.4 Publish Command ke ESP32 (Bonus)

Tambahkan method di `DeviceController.php` untuk mengirim perintah ke ESP32:

```php
use PhpMqtt\Client\MqttClient;

public function sendCommand(Request $request, $device_id)
{
    $validated = $request->validate([
        'action' => 'required|string|in:tare,calibrate',
        'factor' => 'nullable|numeric',
    ]);

    $mqtt = new MqttClient(
        config('mqtt.host'),
        config('mqtt.port'),
        'laravel-publisher-' . uniqid()
    );
    $mqtt->connect();

    $topic = "smart-timbangan/{$device_id}/command";
    $mqtt->publish($topic, json_encode($validated), 1);
    $mqtt->disconnect();

    return response()->json(['success' => true, 'message' => "Command sent to {$device_id}"]);
}
```

Tambahkan route di `api.php`:
```php
Route::post('/devices/{device_id}/command', [DeviceController::class, 'sendCommand']);
```

---

## 7. Perubahan Kode Frontend Next.js (Opsional)

> **Kabar baik: Frontend TIDAK perlu diubah!**

Alur data ke frontend tetap sama:
1. Laravel menerima data dari MQTT (bukan HTTP)
2. Laravel tetap `broadcast(new WeightReceived(...))` via **Reverb**
3. Frontend tetap mendengarkan via **Laravel Echo + Pusher.js**

Frontend kamu yang sudah menggunakan `laravel-echo` + `pusher-js` akan tetap bekerja tanpa perubahan apapun.

---

## 8. Konfigurasi Environment

### Backend `.env` — Tambahkan variabel berikut:

```env
# MQTT Configuration
MQTT_HOST=127.0.0.1
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_CLIENT_ID=laravel-smart-timbangan
```

### ESP32 — Ubah di `main.cpp`:

```cpp
const char* mqttServer = "192.168.1.11";  // IP PC yang menjalankan Mosquitto
const int   mqttPort = 1883;
const char* mqttUser = "";                 // Sesuaikan jika pakai auth
const char* mqttPass = "";
```

---

## 9. Testing & Debugging

### Langkah Testing:

```
Langkah 1: Pastikan Mosquitto berjalan
   └─> mosquitto -c mosquitto.conf -v

Langkah 2: Jalankan Laravel MQTT subscriber
   └─> php artisan mqtt:subscribe

Langkah 3: Test publish manual (tanpa ESP32)
   └─> mosquitto_pub -t "smart-timbangan/TIMBANGAN-01/weight"
       -m "{\"device_id\":\"TIMBANGAN-01\",\"weight\":3.25,\"unit\":\"KG\"}"

Langkah 4: Pastikan output muncul di terminal Laravel

Langkah 5: Pastikan frontend menerima data via Reverb

Langkah 6: Upload kode baru ke ESP32 dan test end-to-end
```

### Tools Debugging:

| Tool                       | Fungsi                                                    |
| -------------------------- | --------------------------------------------------------- |
| **MQTT Explorer** (GUI)    | Monitor semua topic & pesan — https://mqtt-explorer.com   |
| **mosquitto_sub** (CLI)    | Subscribe ke topic: `mosquitto_sub -h localhost -t "#" -v`|
| `php artisan mqtt:subscribe` | Lihat log di terminal Laravel                           |

---

## 10. Perbandingan HTTP vs MQTT

| Aspek                      | HTTP (Saat Ini)                  | MQTT (Baru)                      |
| -------------------------- | -------------------------------- | -------------------------------- |
| **Koneksi**                | Buka-tutup setiap request        | Persistent (1 koneksi)           |
| **Overhead**               | Besar (header HTTP ~300+ byte)   | Kecil (header 2 byte)           |
| **Latency**                | Tinggi (handshake setiap kali)   | Rendah (sudah terkoneksi)        |
| **Deteksi Offline**        | ❌ Tidak bisa                    | ✅ Last Will Testament           |
| **Kirim perintah ke ESP32**| ❌ Tidak bisa                    | ✅ Subscribe topic command       |
| **Reliability**            | Tergantung HTTP response         | QoS 0/1/2                       |
| **Kompleksitas**           | Sederhana                        | Perlu broker tambahan            |
| **Bandwidth per pesan**    | ~500 byte/request                | ~50 byte/message                 |

---

## 11. Kesimpulan & Rekomendasi

### Yang Harus Dikerjakan (Minimal):

1. ✅ Install **Mosquitto** di PC/server
2. ✅ Ubah kode **ESP32** dari HTTP ke MQTT (PubSubClient)
3. ✅ Buat **Artisan command** `mqtt:subscribe` di Laravel
4. ✅ Tambahkan **variabel MQTT** di `.env` backend
5. ✅ Jalankan `php artisan mqtt:subscribe` sebagai proses background

### Yang TIDAK Perlu Diubah:

- ❌ Frontend Next.js (tetap pakai Reverb/Echo)
- ❌ Database/Model (tidak ada perubahan schema)
- ❌ Event broadcasting (WeightReceived tetap sama)

### Urutan Pengerjaan yang Disarankan:

```
1. Install & test Mosquitto         (30 menit)
2. Test dengan mosquitto_pub/sub    (15 menit)
3. Ubah kode ESP32 + upload         (1 jam)
4. Buat Laravel MQTT subscriber     (1 jam)
5. Testing end-to-end               (30 menit)
                                    ─────────
                            Total: ~3-4 jam
```

> **💡 Tip:** Mulailah dari install Mosquitto dan test dengan `mosquitto_pub`/`mosquitto_sub` dulu.
> Pastikan broker berjalan sebelum mengubah kode ESP32 dan Laravel.

> **⚠ Penting:** Endpoint HTTP `/api/sensor/weight` sebaiknya **tetap dipertahankan** sebagai fallback.
> Jangan hapus — biarkan kedua metode berjalan bersamaan selama masa transisi.
