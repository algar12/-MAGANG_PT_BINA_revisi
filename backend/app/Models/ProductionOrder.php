<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'operator_id',
        'batch_number',
        'qty_target',
        'start_date',
        'end_date',
        'status', // Draft, In Progress, Completed
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function operator()
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function productionCostings()
    {
        return $this->hasMany(ProductionCosting::class, 'order_id');
    }
}
