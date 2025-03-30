<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as MongoModel;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends MongoModel
{
    use SoftDeletes;

    protected $connection = 'mongodb';
    protected $collection = 'products';

    protected $fillable = [
        'name',
        'description',
        'quantity',
        'price',
        'category_id',      // ID của category con
        'manufactured_at',
        'expires_at',
        'image_url',
        'image_public_id',
        'images',          // Mảng chứa các hình ảnh phụ và video
        'is_active',
        'deleted_at'
    ];

    protected $casts = [
        'price' => 'float',
        'quantity' => 'integer',
        'manufactured_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'deleted_at' => 'datetime'
    ];

    protected $hidden = [
        'image_public_id',
        'deleted_at',
        'is_active'
    ];

    public function setPriceAttribute($value)
    {
        $this->attributes['price'] = (float)$value;  // Ép kiểu price về float
    }

    public function setQuantityAttribute($value)
    {
        $this->attributes['quantity'] = (int)$value;  // Ép kiểu quantity về integer
    }
    
    public function category()
    {
        return $this->belongsTo(Category::class)->where('level', 1);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Set the images attribute
     */
    public function setImagesAttribute($value)
    {
        $this->attributes['images'] = empty($value) ? [] : $value;
    }

    /**
     * Update product quantity after order
     */
    public function updateQuantity($quantityToReduce)
    {
        if ($this->quantity < $quantityToReduce) {
            throw new \Exception("Số lượng sản phẩm {$this->name} trong kho không đủ");
        }
        
        $this->quantity -= $quantityToReduce;
        $this->save();
        
        return $this;
    }

    /**
     * Check if product has enough quantity
     */
    public function hasEnoughQuantity($requestedQuantity)
    {
        return $this->quantity >= $requestedQuantity;
    }
}