<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Device;
use App\Models\ProductionCosting;
use App\Events\WeightReceived;
use App\Events\CostingUpdated;

class DeviceController extends Controller
{
    public function storeWeight(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|string',
            'weight' => 'required|numeric',
        ]);
        
        $device = Device::where('device_id', $validated['device_id'])->first();
        if (!$device) {
            return response()->json(['success' => false, 'message' => 'Device not found'], 404);
        }
        
        // Broadcast ke React
        broadcast(new WeightReceived(
            device_id: $device->device_id,
            device_name: $device->name,
            weight: (float) $validated['weight'],
        ));
        
        // Cari costing yang pending untuk device ini
        $costing = ProductionCosting::where('device_id', $device->id)
            ->where('status', 'Pending')
            ->first();
        
        if ($costing) {
            $costing->update([
                'netto_produksi' => $validated['weight'],
                'sub_cost_price' => $validated['weight'] * $costing->price_bom,
                'status' => 'Weighed',
            ]);
            
            // Broadcast update
            broadcast(new CostingUpdated($costing->order_id));
        }
        
        return response()->json(['success' => true]);
    }

    public function getLiveWeight($device_id)
    {
        // Fallback untuk HTTP polling jika WebSocket down
        $device = Device::where('device_id', $device_id)->first();
        if (!$device) {
            return response()->json(['success' => false, 'message' => 'Device not found'], 404);
        }

        // Biasanya menyimpan last weight di cache atau DB, tapi untuk API dummy kita kembalikan status saja
        // Dalam implementasi nyata, ESP32 juga bisa update ke Cache::put('weight.'.$device_id, $weight)
        
        return response()->json([
            'device_id' => $device->device_id,
            'device_name' => $device->name,
            'timestamp' => now()->toISOString(),
            // 'weight' => Cache::get('weight.'.$device_id, 0),
        ]);
    }
}
