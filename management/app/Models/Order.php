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
    protected $dates = ['createdAt', 'updatedAt'];

    // Disable Laravel's timestamps
    public $timestamps = false;

    protected $fillable = [
        'order_number',
        'customerId',
        'customerInfo',
        'items',
        'totalAmount',
        'discount',
        'shippingFee',
        'finalTotal',
        'paymentMethod',
        'paymentStatus',
        'shippingMethod',
        'shippingStatus',
        'status',
        'note',
        'staffId',
        'staffInfo',
        'paymentInfo',
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
        'staffInfo' => 'array',
        'paymentInfo' => 'array'
    ];

    protected $attributes = [
        'status' => 'pending',
        'paymentStatus' => 'pending',
        'shippingStatus' => 'pending',
        'discount' => 0,
        'shippingFee' => 0
    ];

    // Định nghĩa các giá trị enum
    public static $paymentMethods = ['cash', 'payos', 'cod', 'Tiền mặt', 'PayOS', 'COD'];
    public static $paymentStatuses = ['paid', 'unpaid', 'pending'];
    public static $shippingMethods = ['Nhận tại cửa hàng', 'Đã giao hàng', 'Giao cho bên vận chuyển', 'Giao hàng sau'];
    public static $shippingStatuses = ['pending', 'shipping', 'delivered'];
    public static $orderStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'completed', 'cancelled'];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($order) {
            $order->createdAt = Carbon::now();
            $order->updatedAt = Carbon::now();
            
            if (!$order->order_number) {
                $order->order_number = $order->generateOrderNumber();
            }

            // Convert payment method to standardized format
            if ($order->paymentMethod) {
                $order->paymentMethod = self::standardizePaymentMethod($order->paymentMethod);
            }
        });

        static::updating(function ($order) {
            $order->updatedAt = Carbon::now();
            
            if ($order->isDirty('paymentMethod')) {
                $order->paymentMethod = self::standardizePaymentMethod($order->paymentMethod);
            }
        });
    }

    public static function standardizePaymentMethod($value)
    {
        $mapping = [
            'Tiền mặt' => 'cash',
            'PayOS' => 'payos',
            'COD' => 'cod'
        ];
        return $mapping[$value] ?? strtolower($value);
    }

    public function generateOrderNumber()
    {
        $prefix = 'DH';
        $date = Carbon::now()->format('ymd');
        
        $lastOrder = self::where('order_number', 'like', $prefix . $date . '%')
            ->orderBy('order_number', 'desc')
            ->first();

        $sequence = 1;
        if ($lastOrder) {
            $lastSequence = substr($lastOrder->order_number, -4);
            if (is_numeric($lastSequence)) {
                $sequence = intval($lastSequence) + 1;
            }
        }

        return $prefix . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function updateStatus($newStatus)
    {
        if (in_array($newStatus, self::$orderStatuses)) {
            $this->status = $newStatus;
            return $this->save();
        }
        throw new \Exception('Invalid status value');
    }

    public static function findByStatus($status)
    {
        return self::where('status', $status)->get();
    }

  
    public function staff()
    {
        return $this->belongsTo(User::class, 'staffId');
    }
} 