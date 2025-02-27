<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use MongoDB\BSON\ObjectId;

class User extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'employees'; // Tên collection trong MongoDB

    protected $fillable = [
        'name', 'email', 'phone'
    ];
}
