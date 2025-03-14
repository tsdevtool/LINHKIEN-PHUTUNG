<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends \MongoDB\Laravel\Eloquent\Model
{
    use HasFactory;
    protected $connection = 'mongodb';
    protected $collection = 'employees';
    protected $fillable = [
        'name','phone','email','role_id','username','password','created_at', 'updated_at','deleted_at'
    ];
}
