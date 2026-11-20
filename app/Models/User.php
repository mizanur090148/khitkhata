<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'password',
        'role',
        'designation',
        'organization_name',
        'factory_id',
        'vendor_id',
        'supplier_id',
        'partner_code',
        'party_code',
        'is_owner',
        'is_vendor_rep',
        'can_message',
        'is_active',
        'phone_verified_at',
        'trial_ends_at',
        'subscription_plan',
        'billing_cycle',
        'last_login_label',
        'permissions_json',
        'profile_json',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_owner' => 'boolean',
            'is_vendor_rep' => 'boolean',
            'can_message' => 'boolean',
            'is_active' => 'boolean',
            'phone_verified_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'permissions_json' => 'array',
            'profile_json' => 'array',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function partner(): HasOne
    {
        return $this->hasOne(Partner::class);
    }

    /**
     * Owned organizations
     */
    public function ownedFactory(): HasOne
    {
        return $this->hasOne(Factory::class, 'owner_id');
    }

    public function ownedVendor(): HasOne
    {
        return $this->hasOne(Vendor::class, 'user_id');
    }

    public function ownedSupplier(): HasOne
    {
        return $this->hasOne(Supplier::class, 'user_id');
    }
}
