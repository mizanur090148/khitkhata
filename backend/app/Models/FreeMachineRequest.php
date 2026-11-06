<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FreeMachineRequest extends Model
{
    use BelongsToTenant;
    protected $fillable = [
        'request_no',
        'factory_id',
        'party_code',
        'contact_person',
        'fabrication',
        'qty_kg',
        'machines_needed',
        'spec_label',
        'start_date',
        'message',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'qty_kg' => 'float',
            'start_date' => 'date:Y-m-d',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }
}

