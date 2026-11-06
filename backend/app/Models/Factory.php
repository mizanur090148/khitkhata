<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Factory extends Model
{
    protected $fillable = [
        'code',
        'name',
        'area',
        'address',
        'phone',
        'total_machines',
        'plan_code',
        'billing_cycle',
        'qr_sticker_enabled',
        'last_update_label',
        'yearly_orders_count',
        'ontime_delivery_pct',
        'qc_reject_pct',
        'settings_json',
    ];

    protected function casts(): array
    {
        return [
            'qr_sticker_enabled' => 'boolean',
            'ontime_delivery_pct' => 'float',
            'qc_reject_pct' => 'float',
            'settings_json' => 'array',
        ];
    }

    public function machines(): HasMany
    {
        return $this->hasMany(FactoryMachine::class);
    }

    public function parties(): HasMany
    {
        return $this->hasMany(Party::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(SubcontractOrder::class);
    }
}

