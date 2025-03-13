<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;
use Carbon\Carbon;

class Order extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'orders';

    protected $fillable = [
        'orderNumber',
        'customerId',
        'customerInfo', // Lưu thông tin khách hàng tại thời điểm đặt hàng
        'items', // Mảng các sản phẩm
        'totalAmount',
        'discount',
        'shippingFee',
        'finalTotal',
        'paymentMethod',
        'paymentStatus',
        'shippingMethod',
        'shippingStatus',
        'note',
        'status', // pending, confirmed, shipping, completed, cancelled
        'staffId',
        'staffInfo',
        'createdAt',
        'updatedAt'
    ];

    protected $casts = [
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
        'totalAmount' => 'float',
        'discount' => 'float',
        'shippingFee' => 'float',
        'finalTotal' => 'float',
        'items' => 'array',
        'customerInfo' => 'array',
        'staffInfo' => 'array'
    ];

    protected $attributes = [
        'status' => 'pending',
        'paymentStatus' => 'unpaid',
        'shippingStatus' => 'pending',
        'discount' => 0,
        'shippingFee' => 0
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($order) {
            $order->createdAt = Carbon::now();
            $order->updatedAt = Carbon::now();
            
            // Tạo mã đơn hàng nếu chưa có
            if (!$order->orderNumber) {
                $order->orderNumber = $order->generateOrderNumber();
            }
        });

        static::updating(function ($order) {
            $order->updatedAt = Carbon::now();
        });
    }

    public function generateOrderNumber()
    {
        $prefix = 'DH';
        $date = Carbon::now()->format('ymd');
        $lastOrder = self::where('orderNumber', 'like', $prefix . $date . '%')
            ->orderBy('orderNumber', 'desc')
            ->first();

        if ($lastOrder) {
            $sequence = intval(substr($lastOrder->orderNumber, -4)) + 1;
        } else {
            $sequence = 1;
        }

        return $prefix . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customerId');
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staffId');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeShipping($query)
    {
        return $query->where('status', 'shipping');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }
} 