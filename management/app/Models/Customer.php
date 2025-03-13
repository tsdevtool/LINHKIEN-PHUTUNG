<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Customer extends \MongoDB\Laravel\Eloquent\Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'customers';

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'numberOfOrders',
        'totalSpent',
        'status',
        'createdAt',
        'updatedAt'
    ];

    protected $casts = [
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
        'numberOfOrders' => 'integer',
        'totalSpent' => 'float'
    ];
} 