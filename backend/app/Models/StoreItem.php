<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreItem extends Model
{
    protected $fillable = [
        'item_code',
        'name',
        'category',
        'unit',
        'stock_qty',
        'min_qty',
        'unit_price',
        'rfq_sent',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'float',
            'rfq_sent' => 'boolean',
        ];
    }
}

