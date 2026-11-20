<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    protected $fillable = [
        'org_name',
        'placement',
        'title',
        'description',
        'cta_label',
        'duration_label',
        'contact_phone',
        'status',
    ];
}

