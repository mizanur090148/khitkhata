<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubcontractPost extends Model
{
    protected $fillable = [
        'user_id',
        'factory_id',
        'post_type',
        'title',
        'fabric_type',
        'gsm',
        'dia',
        'gauge',
        'quantity_kg',
        'target_rate_tk',
        'yarn_count',
        'location',
        'delivery_deadline',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'quantity_kg' => 'float',
            'target_rate_tk' => 'float',
            'delivery_deadline' => 'date:Y-m-d',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }
}

