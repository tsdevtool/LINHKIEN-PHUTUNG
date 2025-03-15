<?php

namespace App\Traits;

enum Role:string
{
    case ADMIN = 'admin';
    case EMPLOYEE = 'employee';
    case CUSTOMER = 'customer';

    public function label():string{
        return match ($this) {
            self::ADMIN => 'Quản trị viên',
            self::EMPLOYEE => 'Nhân viên',
            self::CUSTOMER => 'Khách hàng',
        };
    }
}
