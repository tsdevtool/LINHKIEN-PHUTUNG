<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::connection('mongodb')->hasTable('orders')) {
            Schema::connection('mongodb')->drop('orders');
        }

        Schema::connection('mongodb')->create('orders', function (Blueprint $collection) {
            $collection->unique(['orderNumber']); // Đảm bảo mã đơn hàng là duy nhất
            $collection->index('customerId');
            $collection->index('status');
            $collection->index('createdAt');
           
        });

        // Tạo đơn hàng mẫu
        $order = [
            'orderNumber' => 'DH001',
            'customerId' => '1',
            'customerInfo' => [
                'name' => 'Nguyễn Văn A',
                'phone' => '0123456789',
                'address' => 'Hà Nội'
            ],
            'items' => [
                [
                    'productId' => '1',
                    'name' => 'Sản phẩm 1',
                    'price' => 100000,
                    'quantity' => 2,
                    'total' => 200000
                ]
            ],
            'totalAmount' => 200000,
            'discount' => 0,
            'shippingFee' => 30000,
            'finalTotal' => 230000,
            'paymentMethod' => 'COD',
            'paymentStatus' => 'pending',
            'shippingMethod' => 'standard',
            'shippingStatus' => 'pending',
            'note' => 'Giao hàng giờ hành chính',
            'status' => 'pending',
            'staffId' => '1',
            'staffInfo' => [
                'name' => 'Nhân viên A'
            ],
            'createdAt' => now(),
            'updatedAt' => now()
        ];

        \App\Models\Order::create($order);
    }

    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('orders');
    }
}; 