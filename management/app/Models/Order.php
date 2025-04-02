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
    protected $dates = ['created_at', 'updated_at', 'confirmed_at', 'shipping_updated_at', 'delivered_at', 'cancelled_at'];

    // Disable Laravel's timestamps
    public $timestamps = false;

    protected $fillable = [
        'order_number',
        'customer_id',
        'customer_info',
        'items',
        'total_amount',
        'discount',
        'shipping_fee',
        'finaltotal',
        'payment_method',
        'payment_status',
        'shipping_method',
        'shipping_status',
        'status',
        'note',
        'staff_id',
        'staff_info',
        'payment_info',
        'confirmed_at',
        'shipping_updated_at',
        'delivered_at',
        'cancelled_at',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'total_amount' => 'float',
        'discount' => 'float',
        'shipping_fee' => 'float',
        'finaltotal' => 'float',
        'confirmed_at' => 'datetime',
        'shipping_updated_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'pending',
        'payment_status' => 'pending',
        'shipping_status' => 'pending',
        'discount' => 0,
        'shipping_fee' => 0,
        'items' => [],
        'confirmed_at' => null,
        'shipping_updated_at' => null,
        'delivered_at' => null,
        'cancelled_at' => null
    ];

    // Định nghĩa cấu trúc cho customer_info
    protected $customer_info_structure = [
        'name' => ['type' => 'string', 'required' => true],
        'phone' => ['type' => 'string', 'required' => true],
        'address' => ['type' => 'string', 'required' => true]
    ];

    // Định nghĩa cấu trúc cho items
    protected $items_structure = [
        'product_id' => ['type' => 'ObjectId', 'required' => true],
        'quantity' => ['type' => 'integer', 'required' => true, 'min' => 1],
        'price' => ['type' => 'float', 'required' => true, 'min' => 0],
        'total' => ['type' => 'float', 'required' => true]
    ];

    // Định nghĩa cấu trúc cho staff_info
    protected $staff_info_structure = [
        'name' => ['type' => 'string', 'required' => true]
    ];

    // Định nghĩa cấu trúc cho payment_info
    protected $payment_info_structure = [
        'provider' => ['type' => 'string'],
        'payment_id' => ['type' => 'string'],
        'status' => ['type' => 'string', 'enum' => ['pending', 'paid', 'failed', 'cancelled']],
        'transaction_id' => ['type' => 'string'],
        'paid_at' => ['type' => 'datetime']
    ];

    // Định nghĩa các giá trị enum
    public static $payment_methods = ['cash', 'payos', 'cod', 'Tiền mặt', 'PayOS', 'COD'];
    public static $payment_statuses = ['paid', 'unpaid', 'pending'];
    public static $shipping_methods = ['Nhận tại cửa hàng', 'Đã giao hàng', 'Giao cho bên vận chuyển', 'Giao hàng sau'];
    public static $shipping_statuses = ['pending', 'shipping', 'delivered'];
    public static $order_statuses = ['pending', 'confirmed', 'shipping', 'delivered', 'completed', 'cancelled'];
    public static $payment_info_statuses = ['pending', 'paid', 'failed', 'cancelled'];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($order) {
            $order->created_at = now();
            $order->updated_at = now();
            
            if (!isset($order->order_number)) {
                $order->order_number = $order->generateOrderNumber();
            }
        });

        static::updating(function ($order) {
            $order->updated_at = now();
        });
    }

    public function setItemsAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['items'] = $value;
        } else {
            $this->attributes['items'] = json_decode($value, true) ?? [];
        }
    }

    public function getItemsAttribute($value)
    {
        if (is_array($value)) {
            return $value;
        }
        return json_decode($value, true) ?? [];
    }

    public function generateOrderNumber()
    {
        $prefix = 'DH';
        $date = now()->format('ymd');
        
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
        if (in_array($newStatus, self::$order_statuses)) {
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
        return $this->belongsTo(User::class, 'staff_id');
    }
} 