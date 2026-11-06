<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $fillable = [
        'bill_no',
        'factory_code',
        'party_code',
        'bill_date',
        'jv_no',
        'lines_json',
        'payments_json',
    ];

    protected function casts(): array
    {
        return [
            'bill_date' => 'date:Y-m-d',
            'lines_json' => 'array',
            'payments_json' => 'array',
        ];
    }
}

