<?php

namespace App\Enums;

enum OrderStatus: string
{
    case RUNNING = 'run';
    case WAITING_YARN = 'wait';
    case COMPLETED = 'done';

    public function labelBn(): string
    {
        return match ($this) {
            self::RUNNING => 'চলছে',
            self::WAITING_YARN => 'সুতার অপেক্ষায়',
            self::COMPLETED => 'শেষ',
        };
    }
}

