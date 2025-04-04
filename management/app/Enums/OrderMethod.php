<?php

namespace App\Enums;

enum OrderMethod: string
{
    case PICKUP = 'pickup';
    case DELIVERY = 'delivery';

    public function label(): string
    {
        return match($this) {
            self::PICKUP => 'Nhận tại cửa hàng',
            self::DELIVERY => 'Giao cho bên vận chuyển',
        };
    }
} 