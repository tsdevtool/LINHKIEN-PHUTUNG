<?php

namespace App\Enums;

enum PaymentType: string
{
    case CASH = 'cash';
    case BANK_TRANSFER = 'payos';

    public function label(): string
    {
        return match($this) {
            self::CASH => 'Tiền mặt',
            self::BANK_TRANSFER => 'PayOS',
        };
    }
} 