#include <WiFi.h>
#include <HTTPClient.h>
#include "HX711.h"

// ==========================================
// KONFIGURASI WIFI
// ==========================================
const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI_ANDA";

// ==========================================
// KONFIGURASI API BACKEND
// ==========================================
// Sesuaikan dengan IP address komputer/server backend Laravel (jangan gunakan localhost/127.0.0.1)
const char* serverName = "http://192.168.1.100:8000/api/sensor/weight";
const char* deviceId = "TIMBANGAN-01";

// ==========================================
// KONFIGURASI PIN & SENSOR HX711
// ==========================================
const int LOADCELL_DOUT_PIN = 16;
const int LOADCELL_SCK_PIN = 4;
HX711 scale;

// Faktor Kalibrasi (Dapatkan nilai ini dari proses kalibrasi terlebih dahulu)
// Cara kalibrasi: 
// 1. scale.set_scale();
// 2. Taruh beban yang diketahui (misal 1kg)
// 3. Baca nilai get_units(10)
// 4. Kalibrasi = nilai yang dibaca / berat asli
const float CALIBRATION_FACTOR = 2280.f; 

// Interval pengiriman data (ms)
const unsigned long SEND_INTERVAL = 1000;
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("Memulai sistem Smart Timbangan IoT...");

  // Inisialisasi Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Menghubungkan ke Wi-Fi");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Terhubung ke Wi-Fi dengan IP: ");
  Serial.println(WiFi.localIP());

  // Inisialisasi Sensor HX711
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(CALIBRATION_FACTOR);
  scale.tare(); // Reset timbangan ke 0
  Serial.println("Sensor siap. Timbangan telah di-tare (0 kg).");
}

void loop() {
  // Mengecek apakah sudah waktunya mengirim data
  if (millis() - lastSendTime > SEND_INTERVAL) {
    
    // Pastikan sensor siap sebelum membaca
    if (scale.is_ready()) {
      // Membaca berat rata-rata dari 5 sampel (dalam satuan yang telah dikalibrasi)
      float currentWeight = scale.get_units(5);
      
      // Mencegah nilai minus kecil akibat noise
      if (currentWeight < 0 && currentWeight > -0.05) {
        currentWeight = 0.0;
      }

      Serial.print("Berat terbaca: ");
      Serial.print(currentWeight);
      Serial.println(" kg");

      // Kirim data ke server jika Wi-Fi terhubung
      if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverName);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("Accept", "application/json");

        // Membuat payload JSON secara manual
        String jsonPayload = "{";
        jsonPayload += "\"device_id\":\"" + String(deviceId) + "\",";
        jsonPayload += "\"weight\":" + String(currentWeight, 2);
        jsonPayload += "}";

        // Mengirim HTTP POST request
        int httpResponseCode = http.POST(jsonPayload);
        
        if (httpResponseCode > 0) {
          Serial.print("HTTP Response code: ");
          Serial.println(httpResponseCode);
          String payload = http.getString();
          Serial.println("Response Payload: " + payload);
        } else {
          Serial.print("Error Code HTTP POST: ");
          Serial.println(httpResponseCode);
        }
        
        http.end(); // Bebaskan resource
      } else {
        Serial.println("Koneksi Wi-Fi terputus!");
      }
    } else {
      Serial.println("HX711 tidak merespon/ditemukan.");
    }
    
    lastSendTime = millis();
  }
}
