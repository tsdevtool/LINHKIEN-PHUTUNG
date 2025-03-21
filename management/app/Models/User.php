<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable as AuthAuthenticatable;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
class User extends \MongoDB\Laravel\Eloquent\Model implements Authenticatable
{
    use HasFactory, AuthAuthenticatable;
    use HasApiTokens, Notifiable;
    protected $connection = 'mongodb';
    protected $collection = 'users';
    protected $fillable = [
       'firstname','lastname','phone', 'username','password',
        'address','image',
        'numberOfOrder','numberOfOrders','totalSpent',
        'idrole','status',
        'created_at', 'updated_at','deleted_at'
    ];
    protected $hidden = [
        'password',
    ];

    public function getAuthIdentifierName()
    {
        return '_id';
    }

    /**
     * Trả về giá trị của khóa chính.
     */
    public function getAuthIdentifier()
    {
        return $this->_id;
    }

    /**
     * Trả về tên cột chứa mật khẩu của user.
     */
    public function getAuthPasswordName()
    {
        return 'password';
    }

    /**
     * Trả về giá trị mật khẩu của user.
     */
    public function getAuthPassword()
    {
        return $this->password;
    }

    /**
     * Trả về tên cột nhớ token (nếu có).
     */
    public function getRememberTokenName()
    {
        return null; // Không dùng remember_token với MongoDB
    }

    /**
     * Trả về token nhớ đăng nhập (không áp dụng cho MongoDB).
     */
    public function getRememberToken()
    {
        return null;
    }

    /**
     * Cập nhật token nhớ đăng nhập (không áp dụng cho MongoDB).
     */
    public function setRememberToken($value)
    {
        return null;
    }
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'numberOfOrders' => 'integer',
        'totalSpent' => 'float',
        'phone'=>'string'
    ];
}
