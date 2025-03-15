<?php

namespace App\Enums;

enum CartStatus: string
{
    case PENDING = 'pending';
    case CHECKOUT = 'checkout';
    case DELIVERY = 'delivery';
    case COMPLETED = 'completed';
    case CANCELED = 'canceled';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Đang xử lý',
            self::CHECKOUT => 'Đã xác nhận',
            self::DELIVERY => 'Đang vận chuyển',
            self::COMPLETED => 'Đã hoàn thành',
            self::CANCELED => 'Đã huỷ',
        };
    }

    public static function getValues(): array
    {
        return array_column(self::cases(), 'value');
    }
}
