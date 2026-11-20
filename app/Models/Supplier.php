<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = [
        'user_id',
        'code',
        'name',
        'contact_person',
        'phone',
        'email',
        'category',
        'supplied_items_json',
        'also_categories_json',
        'area',
        'rating',
        'reviews_count',
        'description',
        'is_sponsored',
        'is_verified',
    ];

    protected function casts(): array
    {
        return [
            'supplied_items_json' => 'array',
            'also_categories_json' => 'array',
            'rating' => 'float',
            'is_sponsored' => 'boolean',
            'is_verified' => 'boolean',
        ];
    }

    /**
     * Primary account owner / administrator
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Team members
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'supplier_id');
    }
}

