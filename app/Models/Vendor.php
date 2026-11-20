<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'code',
        'name',
        'type',
        'contact_person',
        'phone',
        'email',
        'area',
        'address',
        'is_verified',
        'settings_json',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'settings_json' => 'array',
    ];

    /**
     * Primary account owner / administrator
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Staff / Merchandisers working under this vendor organization
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'vendor_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(User::class, 'vendor_id');
    }
}

