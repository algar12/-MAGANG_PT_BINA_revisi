<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionCosting extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'material_id',
        'device_id',
        'qty_required',
        'netto_produksi',
        'price_bom',
        'sub_cost_price',
        'status', // Pending, Weighed, Completed
    ];

    protected $casts = [
        'qty_required' => 'decimal:2',
        'netto_produksi' => 'decimal:2',
        'price_bom' => 'decimal:2',
        'sub_cost_price' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(ProductionOrder::class, 'order_id');
    }

    public function material()
    {
        return $this->belongsTo(Material::class, 'material_id');
    }

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
