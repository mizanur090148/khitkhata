<?php

namespace App\Traits;

use App\Models\Factory;
use App\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    /**
     * Boot the BelongsToTenant trait for a model.
     */
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function ($model) {
            if (empty($model->factory_id)) {
                $user = Auth::user() ?? (Auth::guard('sanctum')->check() ? Auth::guard('sanctum')->user() : null);
                if ($user && !empty($user->factory_id)) {
                    $model->factory_id = $user->factory_id;
                }
            }
        });
    }

    /**
     * Define the relationship to the Factory (Tenant).
     */
    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }

    /**
     * Scope to bypass tenant filtering (e.g. for superadmin or background queue jobs).
     */
    public function scopeWithoutTenancy(Builder $query): Builder
    {
        return $query->withoutGlobalScope(TenantScope::class);
    }

    /**
     * Scope explicitly for a given factory id.
     */
    public function scopeForTenant(Builder $query, int $factoryId): Builder
    {
        return $query->withoutGlobalScope(TenantScope::class)
            ->where($this->getTable() . '.factory_id', $factoryId);
    }
}
