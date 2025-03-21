<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends \MongoDB\Laravel\Eloquent\Model
{
    use HasFactory;
    protected $connection = 'mongodb';
    protected $collection = 'roles';

    protected $fillable = [
        'name','created_at','deleted_at','updated_at'
    ];
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];
}
