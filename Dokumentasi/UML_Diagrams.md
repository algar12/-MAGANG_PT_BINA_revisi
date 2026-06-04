# Diagram UML & Alur Sistem

Dokumen ini memuat diagram UML dan representasi visual dari arsitektur serta alur kerja sistem **Smart Timbangan IoT**. Seluruh diagram di bawah ini menggunakan format teks [Mermaid](https://mermaid.js.org/) yang dapat di-*render* secara langsung di platform berbasis Markdown seperti GitHub, GitLab, atau IDE yang mendukung ekstensi Markdown.

---

## 1. Sequence Diagram: Alur Penimbangan Real-Time

Diagram ini mengilustrasikan bagaimana data berat mengalir dari perangkat keras (ESP32) hingga diperbarui secara langsung di peramban pengguna tanpa proses *refresh*.

```mermaid
sequenceDiagram
    participant O as Operator
    participant E as ESP32
    participant A as Laravel API
    participant R as Laravel Reverb
    participant F as Next.js Frontend

    O->>F: Buka Mulai Menimbang dan Pilih Bahan
    F->>F: Menunggu koneksi WebSocket
    F->>R: Subscribe ke Channel
    
    activate E
    E->>A: HTTP POST api sensor weight
    activate A
    A->>A: Validasi Data
    A->>R: Broadcast Event WeightReceived
    deactivate A
    R-->>F: Push Data via WebSocket weight received
    F->>O: Update UI Animasi Angka Timbangan
    
    loop Real-Time Stream
        E->>A: HTTP POST api sensor weight
        A->>R: Broadcast Event
        R-->>F: Push Data
        F->>O: Update Angka Live
    end
    deactivate E

    O->>F: Klik Timbang dan Simpan
    F->>A: HTTP POST api production Simpan Costing
    A-->>F: Respons Sukses
    F->>O: Tampilkan Notifikasi dan Simpan ke Histori
```

---

## 2. Activity Diagram: Alur Kerja Operator (Direct Batching)

Diagram alur (*flowchart*) berikut memodelkan tahapan yang dilakukan oleh operator dalam keseharian produksi.

```mermaid
flowchart TD
    A[Mulai] --> B{Pilih Menu Dashboard}
    
    B -->|Bahan Baku| C[Manajemen Bahan CRUD]
    B -->|Perangkat| D[Manajemen ESP32 CRUD]
    B -->|Produksi| E[Buka Mulai Menimbang]
    
    E --> F[Klik Tambah Sesi Baru]
    F --> G[Pilih Bahan Baku dari Dropdown]
    G --> H[Monitor Live Weight]
    
    H --> I{Apakah Timbangan Sesuai Target}
    I -- Tidak --> H
    
    I -- Ya --> J[Klik Timbang dan Simpan]
    J --> K[Sistem Generate Batch Code]
    K --> L[Data Tersimpan di Database]
    L --> M[Sesi Selesai atau Lanjut Penimbangan Baru]
    
    M --> N[Selesai]
```

---

## 3. Entity Relationship Diagram (ERD) / Class Diagram

Diagram di bawah ini menunjukkan struktur relasional basis data yang menghubungkan perangkat keras, bahan baku, dan riwayat penimbangan (Production Costing).

```mermaid
erDiagram
    DEVICES {
        bigint id PK
        string device_id
        string name
        boolean is_active
    }
    
    MATERIALS {
        bigint id PK
        string kode_produk
        string nama_produk
        string uom_dasar
        decimal unit_cost
    }

    PRODUCTION_COSTINGS {
        bigint id PK
        string batch_number
        bigint material_id FK
        bigint device_id FK
        decimal target_weight
        decimal actual_weight
        string status
        timestamp created_at
    }

    MATERIALS ||--o{ PRODUCTION_COSTINGS : memiliki
    DEVICES ||--o{ PRODUCTION_COSTINGS : menghasilkan
```

---

## 4. Use Case Diagram

Gambaran *Use Case* sistem yang mendeskripsikan peran aktor (Operator & IoT) terhadap fungsionalitas aplikasi.

```mermaid
flowchart LR
    O([Operator])
    E([ESP32 Sensor IoT])

    subgraph Sistem Smart Timbangan
        UC1(Kirim Data Berat RealTime)
        UC2(Monitor Berat Langsung)
        UC3(Buat Sesi Penimbangan)
        UC4(Simpan Data Penimbangan)
        UC5(Kelola Master Bahan Baku)
        UC6(Kelola Master Perangkat Device)
        UC7(Lihat Histori Penimbangan)
    end

    E --> UC1
    UC1 -.->|Memicu Update UI| UC2

    O --> UC2
    O --> UC3
    O --> UC4
    O --> UC5
    O --> UC6
    O --> UC7
```
