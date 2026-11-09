<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubcontractOrder extends Model
{
    use BelongsToTenant, SoftDeletes;
    protected $fillable = [
        'order_no',
        'factory_id',
        'party_id',
        'party_code',
        'buyer',
        'fabric_summary',
        'gsm',
        'finish_gsm',
        'stitch_length',
        'grey_dia',
        'dia_gauge',
        'color',
        'yarn_summary',
        'total_qty_kg',
        'done_kg',
        'delivered_kg',
        'daily_rate_kg',
        'rate_tk',
        'status',
        'start_label',
        'order_date',
        'delivery_due_date',
        'complete_date',
        'today_prod_kg',
        'week_prod_json',
        'machines_json',
        'challans_json',
        'yarn_in_json',
    ];

    protected function casts(): array
    {
        return [
            'total_qty_kg' => 'float',
            'done_kg' => 'float',
            'delivered_kg' => 'float',
            'daily_rate_kg' => 'float',
            'rate_tk' => 'float',
            'today_prod_kg' => 'float',
            'order_date' => 'date:Y-m-d',
            'delivery_due_date' => 'date:Y-m-d',
            'complete_date' => 'date:Y-m-d',
            'week_prod_json' => 'array',
            'machines_json' => 'array',
            'challans_json' => 'array',
            'yarn_in_json' => 'array',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }

    public function party(): BelongsTo
    {
        return $this->belongsTo(Party::class, 'party_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(OrderLine::class)->orderBy('line_index');
    }

    public function productionLogs(): HasMany
    {
        return $this->hasMany(ProductionLog::class);
    }

    public function qcInspections(): HasMany
    {
        return $this->hasMany(QcInspection::class, 'order_no', 'order_no');
    }
}

