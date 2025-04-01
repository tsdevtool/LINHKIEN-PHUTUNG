<?php

namespace App\Enums;

enum OrderType: string
{
    case STORE = 'store';
    case WEBSITE = 'website';

    public function label(): string
    {
        return match($this) {
            self::STORE => 'Tại cửa hàng',
            self::WEBSITE => 'Trên website',
        };
    }
} 