// ============================================================
// Mock Data — Sesuai ANALISIS_PROJECT.md
// ============================================================

import type {
  Material,
  Formula,
  BomItem,
  Device,
  ProductionOrder,
  ProductionCosting,
  DashboardStats,
  RealtimeWeight,
} from "./types";

// --- Materials / Bahan Baku ---
// Contoh dari analisis: Tepung Terigu, Gula Putih, Telur, dll
export const mockMaterials: Material[] = [
  { id: 1, kode_produk: "RM-001", nama_produk: "Tepung Terigu", uom_dasar: "kg", standart_cost: 8000, is_active: true },
  { id: 2, kode_produk: "RM-002", nama_produk: "Gula Putih", uom_dasar: "kg", standart_cost: 12000, is_active: true },
  { id: 3, kode_produk: "RM-003", nama_produk: "Telur Ayam", uom_dasar: "pcs", standart_cost: 1500, is_active: true },
  { id: 4, kode_produk: "RM-004", nama_produk: "Coklat Bubuk", uom_dasar: "kg", standart_cost: 85000, is_active: true },
  { id: 5, kode_produk: "RM-005", nama_produk: "Mentega", uom_dasar: "kg", standart_cost: 32000, is_active: true },
  { id: 6, kode_produk: "RM-006", nama_produk: "Susu Bubuk", uom_dasar: "kg", standart_cost: 45000, is_active: true },
  { id: 7, kode_produk: "RM-007", nama_produk: "Baking Powder", uom_dasar: "kg", standart_cost: 25000, is_active: true },
  { id: 8, kode_produk: "RM-008", nama_produk: "Vanili Ekstrak", uom_dasar: "kg", standart_cost: 120000, is_active: false },
];

// --- Formulas (Resep Produksi) ---
export const mockFormulas: Formula[] = [
  { id: 1, nama_formula: "Brownies Grade A", deskripsi: "Resep brownies premium dengan coklat Van Houten", is_active: true },
  { id: 2, nama_formula: "Roti Manis Premium", deskripsi: "Roti manis lembut dengan filling coklat", is_active: true },
  { id: 3, nama_formula: "Cookies Coklat Chip", deskripsi: "Cookies renyah dengan choco chip", is_active: true },
];

// --- BOM Items (Contoh: Resep Brownies Grade A) ---
export const mockBomItems: BomItem[] = [
  { id: 1, formula_id: 1, material_id: 1, material: mockMaterials[0], qty_required: 500, uom: "gr" },
  { id: 2, formula_id: 1, material_id: 3, material: mockMaterials[2], qty_required: 3, uom: "pcs" },
  { id: 3, formula_id: 1, material_id: 2, material: mockMaterials[1], qty_required: 300, uom: "gr" },
  { id: 4, formula_id: 1, material_id: 4, material: mockMaterials[3], qty_required: 200, uom: "gr" },
  { id: 5, formula_id: 1, material_id: 5, material: mockMaterials[4], qty_required: 250, uom: "gr" },
  // BOM untuk Roti
  { id: 6, formula_id: 2, material_id: 1, material: mockMaterials[0], qty_required: 1000, uom: "gr" },
  { id: 7, formula_id: 2, material_id: 2, material: mockMaterials[1], qty_required: 200, uom: "gr" },
  { id: 8, formula_id: 2, material_id: 6, material: mockMaterials[5], qty_required: 100, uom: "gr" },
];

// --- Devices / Alat Timbangan ---
export const mockDevices: Device[] = [
  { id: 1, device_id: "TIMBANGAN-01", name: "Timbangan Produksi A", location: "Lantai Produksi 1", is_active: true },
  { id: 2, device_id: "TIMBANGAN-02", name: "Timbangan Premix B", location: "Ruang Premix 2", is_active: true },
  { id: 3, device_id: "TIMBANGAN-03", name: "Timbangan QC", location: "Lab Quality Control", is_active: false },
];

// --- Production Orders ---
export const mockOrders: ProductionOrder[] = [
  { id: 1, formula_id: 1, formula: mockFormulas[0], operator_id: 1, operator_name: "Operator Budi", batch_number: "BATCH-20260603-001", qty_target: 2, start_date: "2026-06-03T08:00:00", end_date: null, status: "In Progress" },
  { id: 2, formula_id: 2, formula: mockFormulas[1], operator_id: 1, operator_name: "Operator Budi", batch_number: "BATCH-20260603-002", qty_target: 1, start_date: "2026-06-03T10:00:00", end_date: null, status: "Draft" },
  { id: 3, formula_id: 1, formula: mockFormulas[0], operator_id: 1, operator_name: "Operator Budi", batch_number: "BATCH-20260602-001", qty_target: 3, start_date: "2026-06-02T08:00:00", end_date: "2026-06-02T16:00:00", status: "Completed" },
];

// --- Production Costings ---
// Status: Pending → Weighed → Completed (dari ANALISIS_PROJECT.md)
function generateCostings(): ProductionCosting[] {
  const records: ProductionCosting[] = [];
  const now = new Date();

  // Order 1 (In Progress) — BOM Brownies (5 items)
  const bomBrownies = mockBomItems.filter((b) => b.formula_id === 1);
  const statusSeq: ProductionCosting["status"][] = ["Completed", "Weighed", "Completed", "Pending", "Pending"];

  bomBrownies.forEach((bom, i) => {
    const st = statusSeq[i];
    const netto = st !== "Pending"
      ? parseFloat((bom.qty_required + (Math.random() * 20 - 10)).toFixed(1))
      : null;
    const pricePerUnit = bom.material?.standart_cost ?? 0;
    // Contoh: Tepung 500gr @ 8.000/kg → price_bom = 8/gr
    const priceBom = bom.uom === "gr" ? pricePerUnit / 1000 : pricePerUnit;

    records.push({
      id: i + 1,
      order_id: 1,
      batch_number: "BATCH-20260603-001",
      bom_item_id: bom.id,
      material_name: bom.material?.nama_produk ?? "",
      material_kode: bom.material?.kode_produk ?? "",
      qty_required: bom.qty_required,
      uom: bom.uom,
      device_id: mockDevices[i % 2].id,
      device_name: mockDevices[i % 2].name,
      device_code: mockDevices[i % 2].device_id,
      netto_produksi: netto,
      price_bom: priceBom,
      sub_cost_price: netto ? parseFloat((netto * priceBom).toFixed(2)) : null,
      status: st,
      created_at: new Date(now.getTime() - i * 600000).toISOString(),
    });
  });

  // Order 3 (Completed) — Semua Completed
  bomBrownies.slice(0, 3).forEach((bom, i) => {
    const netto = parseFloat((bom.qty_required + (Math.random() * 10 - 5)).toFixed(1));
    const pricePerUnit = bom.material?.standart_cost ?? 0;
    const priceBom = bom.uom === "gr" ? pricePerUnit / 1000 : pricePerUnit;

    records.push({
      id: 6 + i,
      order_id: 3,
      batch_number: "BATCH-20260602-001",
      bom_item_id: bom.id,
      material_name: bom.material?.nama_produk ?? "",
      material_kode: bom.material?.kode_produk ?? "",
      qty_required: bom.qty_required,
      uom: bom.uom,
      device_id: mockDevices[0].id,
      device_name: mockDevices[0].name,
      device_code: mockDevices[0].device_id,
      netto_produksi: netto,
      price_bom: priceBom,
      sub_cost_price: parseFloat((netto * priceBom).toFixed(2)),
      status: "Completed",
      created_at: new Date(now.getTime() - 86400000 - i * 600000).toISOString(),
    });
  });

  return records;
}

export const mockCostings: ProductionCosting[] = generateCostings();

// --- Dashboard Stats ---
export function getMockStats(): DashboardStats {
  const today = mockCostings.filter((c) => {
    return new Date(c.created_at).toDateString() === new Date().toDateString();
  });
  const totalCost = today.reduce((a, c) => a + (c.sub_cost_price ?? 0), 0);

  return {
    totalPenimbanganHariIni: today.length,
    totalWeighed: today.filter((c) => c.status === "Weighed").length,
    totalPending: today.filter((c) => c.status === "Pending").length,
    totalCompleted: today.filter((c) => c.status === "Completed").length,
    totalCostHariIni: parseFloat(totalCost.toFixed(2)),
    activeDevices: mockDevices.filter((d) => d.is_active).length,
  };
}

// --- Chart Data ---
export function getMockChartData() {
  const data = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    data.push({
      time: time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      penimbangan: Math.floor(Math.random() * 5 + 1),
      completed: Math.floor(Math.random() * 3),
    });
  }
  return data;
}

// --- Realtime Weight ---
// Simulasi: WeightReceived event dari channel scale.{device_id}
export function getMockRealtimeWeight(): RealtimeWeight {
  const device = mockDevices[0];
  const weight = parseFloat((Math.random() * 800 + 50).toFixed(1));
  return {
    device_id: device.device_id,
    device_name: device.name,
    weight,
    unit: "gr",
    timestamp: new Date().toISOString(),
  };
}
