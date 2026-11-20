<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FabricRoll extends Model
{
    protected $fillable = [
        'roll_no',
        'jc_seq',
        'order_no',
        'placement_index',
        'machine_code',
        'date_label',
        'shift',
        'operator_name',
        'weight_kg',
        'yarn_lot',
        'faults_json',
        'challan_no',
    ];

    protected function casts(): array
    {
        return [
            'weight_kg' => 'float',
            'faults_json' => 'array',
        ];
    }
}

