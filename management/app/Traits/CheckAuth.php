<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait CheckAuth
{
    public function checkAuth()
    {
        $user = Auth::user();
        if (!$user) {
            return $this->errorResponse('Người dùng chưa đăng nhập', 401);
        }
        return $user;
    }
}