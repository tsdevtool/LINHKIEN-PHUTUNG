<?php

namespace App\Models;

use App\Enums\OrderMethod;
use App\Enums\OrderType;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\OrderStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'orders';

    protected $fillable = [
        'order_number',
        'recipient_name',
        'recipient_address',
        'recipient_phone',
        'status',
        'payment_type',
        'payment_status',
        'discount',
        'shipping_fee',
        'user_id',
        'employee_id',
        'total',
        'final_total',
        'order_type',
        'order_method',
        'items',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'total' => 'float',
        'discount' => 'float',
        'shipping_fee' => 'float',
        'final_total' => 'float',
        'items' => 'array',
        'status' => OrderStatus::class,
        'payment_type' => PaymentType::class,
        'payment_status' => PaymentStatus::class,
        'order_type' => OrderType::class,
        'order_method' => OrderMethod::class
    ];

    protected $attributes = [
        'status' => 'pending',
        'payment_status' => 'unpaid',
        'discount' => 0,
        'shipping_fee' => 0
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($order) {
            $order->created_at = Carbon::now();
            $order->updated_at = Carbon::now();
            
            // Generate order number if not set
            if (!$order->order_number) {
                $order->order_number = $order->generateOrderNumber();
            }

            // Calculate shipping fee
            if ($order->order_method === OrderMethod::DELIVERY && $order->total < 300000) {
                $order->shipping_fee = 30000;
            }

            // Calculate final total
            $order->final_total = $order->total - $order->discount + $order->shipping_fee;
        });

        static::updating(function ($order) {
            $order->updated_at = Carbon::now();
        });

        // Handle product quantity updates after successful order creation
        static::created(function ($order) {
            foreach ($order->items as $item) {
                $product = Product::find($item['product_id']);
                if ($product) {
                    $product->decrement('quantity', $item['quantity']);
                }
            }
        });

        // Handle product quantity restoration when order is cancelled
        static::updated(function ($order) {
            if ($order->isDirty('status') && $order->status === OrderStatus::CANCELLED) {
                foreach ($order->items as $item) {
                    $product = Product::find($item['product_id']);
                    if ($product) {
                        $product->increment('quantity', $item['quantity']);
                    }
                }
            }
        });
    }

    public function generateOrderNumber()
    {
        $prefix = 'DH';
        $date = Carbon::now()->format('ymd');
        $lastOrder = self::where('order_number', 'like', $prefix . $date . '%')
            ->orderBy('order_number', 'desc')
            ->first();

        if ($lastOrder) {
            $sequence = intval(substr($lastOrder->order_number, -4)) + 1;
        } else {
            $sequence = 1;
        }

        return $prefix . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function canCancel(): bool
    {
        return $this->status === OrderStatus::PENDING;
    }

    public function cancel(): bool
    {
        if (!$this->canCancel()) {
            return false;
        }

        $this->status = OrderStatus::CANCELLED;
        return $this->save();
    }

    public function generateQRCode(): ?string
    {
        if ($this->payment_type !== PaymentType::BANK_TRANSFER) {
            return null;
        }

        // Implement QR code generation logic here
        // You'll need to integrate with your bank's API or use a QR code generation service
        return "QR code data for payment of {$this->final_total} VND";
    }

    public function generateInvoice(): array
    {
        $invoice = [
            'order_number' => $this->order_number,
            'created_at' => $this->created_at->format('d/m/Y H:i:s'),
            'recipient_name' => $this->recipient_name,
            'recipient_phone' => $this->recipient_phone,
            'user' => $this->user ? [
                'name' => $this->user->firstname . ' ' . $this->user->lastname,
                'phone' => $this->user->phone
            ] : null,
            'items' => array_map(function ($item) {
                $product = Product::find($item['product_id']);
                return [
                    'name' => $product ? $product->name : 'Unknown Product',
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['quantity'] * $item['price']
                ];
            }, $this->items),
            'payment_status' => $this->payment_status->label(),
            'payment_type' => $this->payment_type->label(),
            'order_method' => $this->order_method->label(),
            'total' => $this->total,
            'discount' => $this->discount,
            'final_total' => $this->final_total
        ];

        if ($this->order_method === OrderMethod::DELIVERY) {
            $invoice['shipping_fee'] = $this->shipping_fee;
            $invoice['recipient_address'] = $this->recipient_address;
        }

        if ($this->order_type === OrderType::STORE && $this->employee) {
            $invoice['employee'] = [
                'name' => $this->employee->firstname . ' ' . $this->employee->lastname,
                'phone' => $this->employee->phone
            ];
        }

        return $invoice;
    }
} 