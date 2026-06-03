<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\MasterDataController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication
Route::post('/login', [AuthController::class, 'login']);

// IoT Sensor endpoint (open, dipanggil oleh ESP32)
Route::post('/sensor/weight', [DeviceController::class, 'storeWeight']);

// Route yang membutuhkan autentikasi
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return response()->json(['data' => $request->user()]);
    });

    // Production (Mulai Menimbang & Riwayat)
    Route::get('/production-orders/all', [ProductionController::class, 'getAllOrders']);
    Route::get('/production-orders/active', [ProductionController::class, 'getActiveOrders']);
    Route::post('/production-orders', [ProductionController::class, 'store']); // Create new order
    Route::delete('/production-orders/{id}', [ProductionController::class, 'destroy']); // Delete order
    
    Route::get('/costing-all', [ProductionController::class, 'getAllCostings']);
    Route::get('/costing-live/{order_id}', [ProductionController::class, 'getLiveCosting']);
    Route::put('/costings/{id}', [ProductionController::class, 'updateCosting']); // Edit manual weight/status

    // Master Data - Materials
    Route::get('/materials', [MasterDataController::class, 'getMaterials']);
    Route::post('/materials', [MasterDataController::class, 'storeMaterial']);
    Route::put('/materials/{id}', [MasterDataController::class, 'updateMaterial']);
    Route::delete('/materials/{id}', [MasterDataController::class, 'destroyMaterial']);

    // Master Data - Devices
    Route::get('/devices', [MasterDataController::class, 'getDevices']);
    Route::post('/devices', [MasterDataController::class, 'storeDevice']);
    Route::put('/devices/{id}', [MasterDataController::class, 'updateDevice']);
    Route::delete('/devices/{id}', [MasterDataController::class, 'destroyDevice']);

    // Fallback polling (jika Reverb down)
    Route::get('/weight-live/{device_id}', [DeviceController::class, 'getLiveWeight']);
});
