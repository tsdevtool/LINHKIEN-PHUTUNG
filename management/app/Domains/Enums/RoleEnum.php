<?php

namespace App\Domains\Enums;

enum RoleEnum:string
{
    case ADMIN = 'admin';
    case EMPLOYEE = 'employee';
    case CUSTOMER = 'customer';

    public function label():string{
        return match ($this) {
            self::ADMIN => 'Administrator',
            self::EMPLOYEE => 'Employee',
            self::CUSTOMER => 'Customer',
        };
    }
}
