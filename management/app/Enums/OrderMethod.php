<?php

namespace App\Enums;

enum OrderMethod: string
{
    case STORE_PICKUP = 'store_pickup';
    case DELIVERY = 'delivery';

    public function label(): string
    {
        return match($this) {
            self::STORE_PICKUP => 'Nhận tại cửa hàng',
            self::DELIVERY => 'Giao cho bên vận chuyển',
        };
    }
} 