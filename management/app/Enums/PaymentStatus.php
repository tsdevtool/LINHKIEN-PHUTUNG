<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PAID = 'paid';
    case UNPAID = 'unpaid';

    public function label(): string
    {
        return match($this) {
            self::PAID => 'Đã thanh toán',
            self::UNPAID => 'Chưa thanh toán',
        };
    }
} 