<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FactoryMachine extends Model
{
    use BelongsToTenant;
    protected $fillable = [
        'factory_id',
        'code',
        'knit_type',
        'dia',
        'gauge',
        'spec_label',
        'brand',
        'status',
        'current_order_no',
        'broadcast_free',
        'free_from',
        'daily_capacity_kg',
        'rate_label',
        'supported_fabrics_json',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'broadcast_free' => 'boolean',
            'free_from' => 'date:Y-m-d',
            'supported_fabrics_json' => 'array',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }
}

