<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionLog extends Model
{
    protected $fillable = [
        'subcontract_order_id',
        'order_no',
        'placement_index',
        'date_label',
        'shift',
        'machine_code',
        'operator_name',
        'qty_kg',
        'rolls_count',
        'yarn_lot',
        'fault_code',
    ];

    protected function casts(): array
    {
        return [
            'qty_kg' => 'float',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(SubcontractOrder::class, 'subcontract_order_id');
    }
}

