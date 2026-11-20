<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierRfq extends Model
{
    protected $fillable = [
        'rfq_no',
        'factory_code',
        'category',
        'item_name',
        'qty_label',
        'area',
        'phone',
        'need_by_label',
        'status',
        'quoted_price',
        'delivery_days',
        'note',
    ];
}

