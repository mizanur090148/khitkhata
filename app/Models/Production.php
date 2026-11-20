<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Production extends Model
{
    protected $table = 'productions';

    protected $fillable = [
        'subcontract_order_id',
        'user_id',
        'employee_id',
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
            'user_id' => 'integer',
            'employee_id' => 'integer',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(SubcontractOrder::class, 'subcontract_order_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class, 'employee_id');
    }
}
