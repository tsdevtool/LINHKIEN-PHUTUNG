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
        'name',
    ];
}
