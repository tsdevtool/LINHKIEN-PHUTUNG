<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
class User extends \MongoDB\Laravel\Eloquent\Model
{
    use HasFactory;
    protected $connection = 'mongodb';
    protected $collection = 'users';
    protected $fillable = [
       'firstname','lastname','phone','password','image','numberOfOrder'
    ];
}
