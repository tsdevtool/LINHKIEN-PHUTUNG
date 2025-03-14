<?php

namespace App;

enum OrderStatusEnum
{
    const STATUS_PENDING = 'pending';
    const STATUS_CHECKOUT = 'checkout';
    const STATUS_DELIVERY = 'delivery';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELED = 'canceled';

    public function label():string{
        return match ($this) {
            self::STATUS_PENDING => 'Đang xử lý',
            self::STATUS_CHECKOUT => 'Đã xác nhận',
            self::STATUS_DELIVERY => 'Đang vận chuyển',
            self::STATUS_COMPLETED => 'Đã hoàn thành',
            self::STATUS_CANCELED => 'Đã huỷ',
        };
    }
}
