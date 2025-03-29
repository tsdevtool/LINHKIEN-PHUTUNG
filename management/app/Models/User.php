<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Model implements AuthenticatableContract
{
    use Authenticatable, HasApiTokens, Notifiable;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'firstname',
        'lastname',
        'phone',
        'email',
        'password',
        'image',
        'idrole',
        'status',
        'numberOfOrders',
        'totalSpent'
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'status' => 'boolean',
        'numberOfOrders' => 'integer',
        'totalSpent' => 'integer'
    ];

    public function role()
    {
        return $this->belongsTo(Role::class, 'idrole', '_id');
    }

    public function getAuthIdentifierName()
    {
        return '_id';
    }

    public function getAuthIdentifier()
    {
        return $this->_id;
    }

    public function getAuthPassword()
    {
        return $this->password;
    }

    public function getRememberToken()
    {
        return null;
    }

    public function setRememberToken($value)
    {
        return null;
    }

    public function getRememberTokenName()
    {
        return null;
    }
}
