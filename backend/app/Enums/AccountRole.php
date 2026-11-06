<?php

namespace App\Enums;

enum AccountRole: string
{
    case FACTORY = 'fac';
    case VENDOR = 'ven';
    case SUPPLIER = 'sup';
    case PARTNER = 'par';

    public function labelBn(): string
    {
        return match ($this) {
            self::FACTORY => 'ফ্যাক্টরি',
            self::VENDOR => 'ভেন্ডর',
            self::SUPPLIER => 'সাপ্লায়ার',
            self::PARTNER => 'পার্টনার',
        };
    }
}

