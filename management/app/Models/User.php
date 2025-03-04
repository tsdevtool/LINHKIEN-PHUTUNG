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
       'firstname','lastname','phone','password','image','numberOfOrder'
    ];
    protected $hidden = [
        'password',
    ];
}
