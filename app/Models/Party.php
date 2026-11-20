<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Party extends Model
{
    use BelongsToTenant, SoftDeletes;
    protected $fillable = [
        'factory_id',
        'code',
        'name',
        'type',
        'address',
        'contact_person',
        'phone',
        'email',
        'bin_tin',
        'default_rate_tk',
        'payment_terms',
        'opening_balance',
        'added_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'default_rate_tk' => 'float',
            'opening_balance' => 'float',
            'added_date' => 'date:Y-m-d',
            'is_active' => 'boolean',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(SubcontractOrder::class, 'party_id');
    }
}

