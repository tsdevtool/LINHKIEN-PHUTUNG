<?php

namespace App\Models;

use App\Enums\CartStatus;
use MongoDB\Laravel\Eloquent\Model as MongoModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Cart extends MongoModel
{
    protected $connection = 'mongodb';
    protected $collection = 'carts';

    protected $fillable = [
        'user_id',
        'status',
        'total_price',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'user_id' => 'string',
        'status' => CartStatus::class,
        'total_price' => 'decimal:3',
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
            if (!$model->status) {
                $model->status = CartStatus::PENDING;
            }
        });

        static::updating(function ($model) {
            $model->updated_at = $model->freshTimestamp();
        });
    }

    // Quan hệ với User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Quan hệ với CartItem
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    // Kiểm tra trạng thái giỏ hàng
    public function isPending(): bool
    {
        return $this->status === CartStatus::PENDING;
    }

    public function isCheckout(): bool
    {
        return $this->status === CartStatus::CHECKOUT;
    }

    public function isDelivery(): bool
    {
        return $this->status === CartStatus::DELIVERY;
    }

    public function isCompleted(): bool
    {
        return $this->status === CartStatus::COMPLETED;
    }

    public function isCanceled(): bool
    {
        return $this->status === CartStatus::CANCELED;
    }

    // Cập nhật trạng thái
    public function updateStatus(CartStatus $status): bool
    {
        $this->status = $status;
        return $this->save();
    }

    // Lấy label của trạng thái hiện tại
    public function getStatusLabel(): string
    {
        return $this->status->label();
    }

    // Tính tổng giá trị giỏ hàng
    public function calculateTotalPrice(): void
    {
        $total = $this->items()->sum('total_price');
        $this->total_price = $total;
        $this->save();
    }

    // Thêm sản phẩm vào giỏ hàng
    public function addItem(Product $product, int $quantity = 1): CartItem
    {
        $existingItem = $this->items()->where('product_id', $product->id)->first();

        if ($existingItem) {
            $existingItem->increaseQuantity($quantity);
            return $existingItem;
        }

        $cartItem = $this->items()->create([
            'product_id' => $product->id,
            'quantity' => $quantity,
            'price' => $product->price
        ]);

        $this->calculateTotalPrice();

        return $cartItem;
    }

    // Xóa sản phẩm khỏi giỏ hàng
    public function removeItem(string $productId): bool
    {
        $deleted = $this->items()->where('product_id', $productId)->delete();
        if ($deleted) {
            $this->calculateTotalPrice();
        }
        return $deleted > 0;
    }

    // Cập nhật số lượng sản phẩm
    public function updateItemQuantity(string $productId, int $quantity): bool
    {
        $item = $this->items()->where('product_id', $productId)->first();
        if ($item) {
            $item->updateQuantity($quantity);
            $this->calculateTotalPrice();
            return true;
        }
        return false;
    }

    // Xóa tất cả sản phẩm trong giỏ hàng
    public function clearItems(): bool
    {
        $deleted = $this->items()->delete();
        $this->total_price = 0;
        $this->save();
        return $deleted > 0;
    }
}
