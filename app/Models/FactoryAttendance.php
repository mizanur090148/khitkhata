<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FactoryAttendance extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'factory_id',
        'worker_name',
        'role_type',
        'shift',
        'status',
        'attendance_date',
        'in_time',
        'out_time',
        'overtime_hours',
        'daily_wage_tk',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
            'overtime_hours' => 'float',
            'daily_wage_tk' => 'float',
        ];
    }
}
