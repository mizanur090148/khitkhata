<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderLine extends Model
{
    protected $fillable = [
        'subcontract_order_id',
        'line_index',
        'knit_type',
        'is_yarn_dyed',
        'unit',
        'placement',
        'fabrication',
        'color',
        'qty',
        'done_qty',
        'delivered_qty',
        'grey_gsm',
        'finish_gsm',
        'stitch_length',
        'grey_dia',
        'dia_gauge',
        'flat_size',
        'piece_weight_gm',
        'flat_design',
        'machines_json',
        'yarns_json',
    ];

    protected function casts(): array
    {
        return [
            'is_yarn_dyed' => 'boolean',
            'qty' => 'float',
            'done_qty' => 'float',
            'delivered_qty' => 'float',
            'machines_json' => 'array',
            'yarns_json' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(SubcontractOrder::class, 'subcontract_order_id');
    }
}

