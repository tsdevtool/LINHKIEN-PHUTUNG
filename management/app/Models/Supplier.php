<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends \MongoDB\Laravel\Eloquent\Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'suppliers';

    protected $fillable = [
        'name',
        'phone',
        'email',    
        'address',
        'is_play',
    ];
}
