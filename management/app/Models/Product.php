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
        'deleted_at',
        'pending_actual_quantity', // Số lượng Nhân viên kiểm kho đang chờ xử lý
        'is_checked_stock'  // Trạng thái kiểm tra hàng tồn kho
    ];

    protected $casts = [
        'price' => 'float',
        'quantity' => 'integer',
        'manufactured_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'deleted_at' => 'datetime',
        'pending_actual_quantity' => 'integer',
        'is_checked_stock' => 'string'
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

    public function setPendingActualQuantityAttribute($value)
    {
        $this->attributes['pending_actual_quantity'] = (int)$value;  // Ép kiểu quantity về integer
    }

    public function category()
    {
        return $this->belongsTo(Category::class)->where('level', 1);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForConfirmation($query)
    {
        return $query->where('is_checked_stock', 'Đã xác nhận');
    }

    public function scopeWaitingForConfirmation($query)
    {
        return $query->where('is_checked_stock', 'Chờ xác nhận');
    }

    public function scopeWaitingForStockCheck($query)
    {
        return $query->where('is_checked_stock', 'Chờ kiểm kho');
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