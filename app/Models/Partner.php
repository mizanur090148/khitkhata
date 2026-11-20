<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Partner extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'partner_code',
        'total_referrals',
        'active_factories_count',
        'total_commission_tk',
        'withdrawn_commission_tk',
        'balance_commission_tk',
        'payout_method',
        'payout_number',
    ];

    protected $casts = [
        'total_referrals' => 'integer',
        'active_factories_count' => 'integer',
        'total_commission_tk' => 'decimal:2',
        'withdrawn_commission_tk' => 'decimal:2',
        'balance_commission_tk' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

