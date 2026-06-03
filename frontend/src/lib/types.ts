// ============================================================
// TypeScript Interfaces — Sesuai ANALISIS_PROJECT.md
// Tables: users, devices, materials, formulas, bom_items,
//         production_orders, production_costings
// ============================================================

// --- users ---
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "operator";
  is_active: boolean;
}

// --- devices ---
export interface Device {
  id: number;
  device_id: string;       // Identifier ESP32 (TIMBANGAN-01)
  name: string;             // Nama friendly device
  location: string | null;  // Lokasi perangkat
  is_active: boolean;
}

// --- materials (Bahan Baku) ---
export interface Material {
  id: number;
  kode_produk: string;      // SKU material
  nama_produk: string;      // Nama bahan baku
  uom_dasar: string;        // Unit (kg, ons, pcs)
  standart_cost: number;    // Harga standar per unit
  is_active: boolean;
}

// --- formulas (Resep/Formula Produksi) ---
export interface Formula {
  id: number;
  nama_formula: string;     // Nama resep (Kue Brownies, Roti, dll)
  deskripsi: string | null;
  is_active: boolean;
}

// --- bom_items (Bill of Materials) ---
export interface BomItem {
  id: number;
  formula_id: number;
  material_id: number;
  material?: Material;       // joined
  qty_required: number;      // Jumlah yang dibutuhkan
  uom: string;               // Unit (kg, ons, pcs)
}

// --- production_orders (Order Produksi) ---
export interface ProductionOrder {
  id: number;
  formula_id: number;
  formula?: Formula;          // joined
  operator_id: number | null;
  operator_name?: string;     // joined
  batch_number: string;       // Nomor batch
  qty_target: number;         // Jumlah target produksi
  start_date: string;
  end_date: string | null;
  status: "Draft" | "In Progress" | "Completed";
}

// --- production_costings (Perhitungan Biaya Real-Time) ---
// Status: Pending → Weighed → Completed
export interface ProductionCosting {
  id: number;
  order_id: number;
  batch_number?: string;      // joined from production_order
  bom_item_id: number;
  material_name?: string;     // joined via bom_item → material
  material_kode?: string;     // joined
  qty_required?: number;      // joined dari bom_item
  uom?: string;               // joined dari bom_item
  device_id: number | null;
  device_name?: string;       // joined
  device_code?: string;       // joined (device.device_id)
  netto_produksi: number | null;  // Berat aktual dari ESP32
  price_bom: number;              // Harga per unit BOM
  sub_cost_price: number | null;  // Biaya = netto × price (calculated)
  status: "Pending" | "Weighed" | "Completed";
  created_at: string;
}

// --- Dashboard Stats ---
export interface DashboardStats {
  totalPenimbanganHariIni: number;
  totalWeighed: number;
  totalPending: number;
  totalCompleted: number;
  totalCostHariIni: number;
  activeDevices: number;
}

// --- Realtime Weight (dari WeightReceived Event via Reverb) ---
// Channel: scale.{device_id} | Event: weight.received
export interface RealtimeWeight {
  device_id: string;
  device_name: string;
  weight: number | null;
  unit: string;
  timestamp: string;
}
