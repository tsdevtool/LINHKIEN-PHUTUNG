<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends \MongoDB\Laravel\Eloquent\Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'products';

    protected $fillable = [
        'name',
        'description',
        'quantity',    
        'price',
        'image_url',
        'category_id',
        'manufactured_at',
        'expires_at',
        'created_at',
        'updated_at',
    ];
}
