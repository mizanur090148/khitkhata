<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FactoryAttendance extends Model
{
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

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }
}

