<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductionOrder;
use App\Models\ProductionCosting;
use App\Models\Device;
use App\Models\Material;

class ProductionController extends Controller
{
    public function getAllOrders()
    {
        $orders = ProductionOrder::with('operator')->get();
        return response()->json(['data' => $orders]);
    }

    public function getActiveOrders()
    {
        $orders = ProductionOrder::with('operator')
            ->whereIn('status', ['Draft', 'In Progress'])
            ->get();
            
        return response()->json(['data' => $orders]);
    }

    public function getLiveCosting($order_id)
    {
        $costings = ProductionCosting::with(['material', 'device'])
            ->where('order_id', $order_id)
            ->get()
            ->map(function ($costing) {
                return $this->formatCosting($costing);
            });

        return response()->json(['data' => $costings]);
    }

    public function getAllCostings()
    {
        $costings = ProductionCosting::with(['material', 'device', 'order'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($costing) {
                return $this->formatCosting($costing);
            });

        return response()->json(['data' => $costings]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'material_id' => 'required|exists:materials,id',
            'qty_target' => 'nullable|numeric',
        ]);

        $material = Material::findOrFail($request->material_id);
        
        // Auto assign device
        $device = Device::where('is_active', true)->first();

        // Create Order
        $order = ProductionOrder::create([
            'operator_id' => $request->user()->id ?? null,
            'batch_number' => 'BATCH-' . date('YmdHis'),
            'qty_target' => $request->qty_target ?? 1,
            'start_date' => now(),
            'status' => 'In Progress',
        ]);

        // Create Costing
        ProductionCosting::create([
            'order_id' => $order->id,
            'material_id' => $material->id,
            'device_id' => $device ? $device->id : null,
            'qty_required' => $request->qty_target ?? 1,
            'price_bom' => $material->standart_cost,
            'status' => 'Pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Penimbangan baru berhasil dibuat.',
            'data' => $order
        ]);
    }

    public function updateCosting(Request $request, $id)
    {
        $request->validate([
            'netto_produksi' => 'required|numeric'
        ]);

        $costing = ProductionCosting::findOrFail($id);
        $costing->netto_produksi = $request->netto_produksi;
        $costing->sub_cost_price = $request->netto_produksi * $costing->price_bom;
        $costing->status = 'Weighed';
        $costing->save();

        event(new \App\Events\CostingUpdated($costing->order_id));

        return response()->json([
            'success' => true,
            'message' => 'Data penimbangan berhasil diupdate.'
        ]);
    }

    public function destroy($id)
    {
        $order = ProductionOrder::findOrFail($id);
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data penimbangan berhasil dihapus.'
        ]);
    }

    private function formatCosting($costing)
    {
        return [
            'id' => $costing->id,
            'order_id' => $costing->order_id,
            'batch_number' => $costing->order->batch_number ?? null,
            'material_id' => $costing->material_id,
            'material_name' => $costing->material->nama_produk ?? null,
            'material_kode' => $costing->material->kode_produk ?? null,
            'qty_required' => (float) $costing->qty_required,
            'uom' => $costing->material->uom_dasar ?? null,
            'device_id' => $costing->device_id,
            'device_name' => $costing->device->name ?? null,
            'device_code' => $costing->device->device_id ?? null,
            'netto_produksi' => $costing->netto_produksi !== null ? (float) $costing->netto_produksi : null,
            'price_bom' => (float) $costing->price_bom,
            'sub_cost_price' => $costing->sub_cost_price !== null ? (float) $costing->sub_cost_price : null,
            'status' => $costing->status,
            'created_at' => $costing->created_at,
        ];
    }
}
