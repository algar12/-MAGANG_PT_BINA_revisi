<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Material;
use App\Models\Device;

class MasterDataController extends Controller
{
    // --- MATERIALS ---
    public function getMaterials()
    {
        return response()->json(['data' => Material::orderBy('id', 'desc')->get()]);
    }

    public function storeMaterial(Request $request)
    {
        $validated = $request->validate([
            'kode_produk' => 'required|string|unique:materials,kode_produk',
            'nama_produk' => 'required|string',
            'uom_dasar' => 'required|string',
            'standart_cost' => 'required|numeric',
        ]);
        
        $validated['is_active'] = $request->input('is_active', true);
        $material = Material::create($validated);

        return response()->json(['success' => true, 'data' => $material]);
    }

    public function updateMaterial(Request $request, $id)
    {
        $material = Material::findOrFail($id);
        
        $validated = $request->validate([
            'kode_produk' => 'required|string|unique:materials,kode_produk,' . $id,
            'nama_produk' => 'required|string',
            'uom_dasar' => 'required|string',
            'standart_cost' => 'required|numeric',
        ]);
        
        $validated['is_active'] = $request->input('is_active', true);
        $material->update($validated);

        return response()->json(['success' => true, 'data' => $material]);
    }

    public function destroyMaterial($id)
    {
        $material = Material::findOrFail($id);
        $material->delete();
        return response()->json(['success' => true]);
    }

    // --- DEVICES ---
    public function getDevices()
    {
        return response()->json(['data' => Device::orderBy('id', 'desc')->get()]);
    }

    public function storeDevice(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|string|unique:devices,device_id',
            'name' => 'required|string',
            'location' => 'nullable|string',
        ]);
        
        $validated['is_active'] = $request->input('is_active', true);
        $device = Device::create($validated);

        return response()->json(['success' => true, 'data' => $device]);
    }

    public function updateDevice(Request $request, $id)
    {
        $device = Device::findOrFail($id);
        
        $validated = $request->validate([
            'device_id' => 'required|string|unique:devices,device_id,' . $id,
            'name' => 'required|string',
            'location' => 'nullable|string',
        ]);
        
        $validated['is_active'] = $request->input('is_active', true);
        $device->update($validated);

        return response()->json(['success' => true, 'data' => $device]);
    }

    public function destroyDevice($id)
    {
        $device = Device::findOrFail($id);
        $device->delete();
        return response()->json(['success' => true]);
    }
}
