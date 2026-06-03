<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Device;
use App\Models\Material;
use App\Models\ProductionOrder;
use App\Models\ProductionCosting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Users
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@smart.io',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        $operator = User::create([
            'name' => 'Operator Budi',
            'email' => 'operator@smart.io',
            'password' => Hash::make('operator123'),
            'role' => 'operator',
        ]);

        // 2. Devices
        $device1 = Device::create([
            'device_id' => 'TIMBANGAN-01',
            'name' => 'Timbangan Produksi A',
            'location' => 'Lantai Produksi 1',
        ]);

        $device2 = Device::create([
            'device_id' => 'TIMBANGAN-02',
            'name' => 'Timbangan Premix B',
            'location' => 'Ruang Premix 2',
        ]);

        // 3. Materials
        $matTepung = Material::create([
            'kode_produk' => 'RM-001',
            'nama_produk' => 'Tepung Terigu',
            'uom_dasar' => 'GRAM',
            'standart_cost' => 8, // Rp 8.000 / kg = Rp 8 / gram
        ]);

        $matGula = Material::create([
            'kode_produk' => 'RM-002',
            'nama_produk' => 'Gula Putih',
            'uom_dasar' => 'GRAM',
            'standart_cost' => 12, // Rp 12.000 / kg = Rp 12 / gram
        ]);

        $matTelur = Material::create([
            'kode_produk' => 'RM-003',
            'nama_produk' => 'Telur Ayam',
            'uom_dasar' => 'PCS',
            'standart_cost' => 1500, // Rp 1.500 / pcs
        ]);

        // 4. Production Order
        $order = ProductionOrder::create([
            'operator_id' => $operator->id,
            'batch_number' => 'BATCH-20260603-001',
            'qty_target' => 1,
            'start_date' => now(),
            'status' => 'In Progress',
        ]);

        // 5. Production Costings
        ProductionCosting::create([
            'order_id' => $order->id,
            'material_id' => $matTepung->id,
            'device_id' => $device1->id,
            'qty_required' => 500,
            'netto_produksi' => 506.0,
            'price_bom' => 8,
            'sub_cost_price' => 506.0 * 8,
            'status' => 'Completed',
        ]);

        ProductionCosting::create([
            'order_id' => $order->id,
            'material_id' => $matTelur->id,
            'device_id' => $device2->id,
            'qty_required' => 3,
            'netto_produksi' => 3,
            'price_bom' => 1500,
            'sub_cost_price' => 3 * 1500,
            'status' => 'Weighed',
        ]);

        ProductionCosting::create([
            'order_id' => $order->id,
            'material_id' => $matGula->id,
            'device_id' => $device1->id,
            'qty_required' => 300,
            'netto_produksi' => null,
            'price_bom' => 12,
            'sub_cost_price' => null,
            'status' => 'Pending',
        ]);
    }
}
