<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'factory_id',
        'employee_type',
        'id_no',
        'name',
        'mobile',
        'address',
        'designation',
        'shift',
        'machine_assigned',
        'daily_wage',
        'joining_date',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'daily_wage' => 'float',
            'joining_date' => 'date',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }

    public function productions(): HasMany
    {
        return $this->hasMany(Production::class, 'employee_id');
    }

    public function scopeOperators($query)
    {
        return $query->where('employee_type', 'operator');
    }
}

