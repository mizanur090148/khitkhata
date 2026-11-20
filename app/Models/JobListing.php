<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobListing extends Model
{
    protected $fillable = [
        'role_title',
        'company_name',
        'area',
        'category',
        'shift_label',
        'experience_label',
        'salary_label',
        'posted_label',
        'contact_phone',
        'is_new',
        'vacancies',
        'requirements_json',
    ];

    protected function casts(): array
    {
        return [
            'is_new' => 'boolean',
            'requirements_json' => 'array',
        ];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }
}

