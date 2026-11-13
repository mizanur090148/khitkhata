<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $user = Auth::user() ?? (Auth::guard('sanctum')->check() ? Auth::guard('sanctum')->user() : null);

        if ($user && !empty($user->factory_id)) {
            $builder->where($model->getTable() . '.factory_id', $user->factory_id);
        }
    }
}
