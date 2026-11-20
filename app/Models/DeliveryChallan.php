<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryChallan extends Model
{
    protected $fillable = [
        'challan_no',
        'factory_code',
        'party_code',
        'order_no',
        'date_label',
        'rolls_json',
        'vehicle_no',
        'driver_name',
        'driver_phone',
        'factory_sign_json',
        'vendor_sign_json',
    ];

    protected function casts(): array
    {
        return [
            'rolls_json' => 'array',
            'factory_sign_json' => 'array',
            'vendor_sign_json' => 'array',
        ];
    }
}

