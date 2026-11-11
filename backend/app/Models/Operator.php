<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class Operator extends Employee
{
    protected $table = 'employees';

    protected static function booted()
    {
        static::addGlobalScope('operator', function (Builder $builder) {
            $builder->where('employee_type', 'operator');
        });

        static::creating(function ($operator) {
            $operator->employee_type = 'operator';
        });
    }
}
