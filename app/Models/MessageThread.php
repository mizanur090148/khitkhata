<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageThread extends Model
{
    protected $fillable = [
        'thread_code',
        'factory_code',
        'party_code',
        'order_no',
        'title',
        'unread_count',
        'messages_json',
    ];

    protected function casts(): array
    {
        return [
            'messages_json' => 'array',
        ];
    }
}

