<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_produk',
        'nama_produk',
        'uom_dasar',
        'standart_cost',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'standart_cost' => 'decimal:2',
    ];

    public function bomItems()
    {
        return $this->hasMany(BomItem::class);
    }
}
