<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as MongoModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends MongoModel
{
    protected $connection = 'mongodb';
    protected $collection = 'cart_items';

    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
        'price',
        'total_price',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'cart_id' => 'string',
        'product_id' => 'string',
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();

        // Tự động cập nhật timestamps
        static::creating(function ($model) {
            $model->created_at = $model->freshTimestamp();
            $model->updated_at = $model->freshTimestamp();
        });

        static::updating(function ($model) {
            $model->updated_at = $model->freshTimestamp();
        });

        // Tự động tính total_price khi thêm mới hoặc cập nhật
        static::saving(function ($model) {
            $model->total_price = $model->quantity * $model->price;
        });
    }

    // Quan hệ với Cart
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    // Quan hệ với Product
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Cập nhật số lượng
    public function updateQuantity(int $quantity): void
    {
        if ($quantity > 0) {
            $this->quantity = $quantity;
            $this->save();
        }
    }

    // Tăng số lượng
    public function increaseQuantity(int $amount = 1): void
    {
        $this->quantity += $amount;
        $this->save();
    }

    // Giảm số lượng
    public function decreaseQuantity(int $amount = 1): void
    {
        if ($this->quantity > $amount) {
            $this->quantity -= $amount;
            $this->save();
        }
    }

    // Cập nhật giá
    public function updatePrice(float $price): void
    {
        $this->price = $price;
        $this->save();
    }

    // Lấy thông tin sản phẩm
    public function getProductInfo(): array
    {
        return [
            'id' => $this->product_id,
            'quantity' => $this->quantity,
            'price' => $this->price,
            'total_price' => $this->total_price,
            'product' => $this->product
        ];
    }
}
