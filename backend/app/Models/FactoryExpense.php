<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FactoryExpense extends Model
{
    protected $fillable = [
        'factory_id',
        'category',
        'title',
        'amount_tk',
        'payment_method',
        'reference_no',
        'expense_date',
        'created_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount_tk' => 'float',
            'expense_date' => 'date',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }
}

