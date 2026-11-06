<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreIssueLog extends Model
{
    protected $fillable = [
        'item_code',
        'date_label',
        'machine_code',
        'qty',
        'issued_by',
    ];
}

