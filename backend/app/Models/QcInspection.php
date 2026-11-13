<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QcInspection extends Model
{
    protected $fillable = [
        'qc_no',
        'order_no',
        'placement_index',
        'placement_name',
        'date_label',
        'roll_no',
        'machine_code',
        'weight_kg',
        'issue_description',
        'source',
        'factory_sign_json',
        'vendor_sign_json',
        'action_taken',
    ];

    protected function casts(): array
    {
        return [
            'weight_kg' => 'float',
            'factory_sign_json' => 'array',
            'vendor_sign_json' => 'array',
        ];
    }

    public function order()
    {
        return $this->belongsTo(SubcontractOrder::class, 'order_no', 'order_no');
    }
}

