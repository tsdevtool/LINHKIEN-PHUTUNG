<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::connection('mongodb')->hasTable('customers')) {
            Schema::connection('mongodb')->drop('customers');
        }

        Schema::connection('mongodb')->create('customers', function (Blueprint $collection) {
            // Tạo indexes
            $collection->index('name');
           
            $collection->index('email');
            $collection->unique(['phone']); // Đảm bảo số điện thoại là duy nhất
        });

        // Thêm dữ liệu mẫu
        $customers = [
            [
                'name' => 'Nguyễn Văn A',
                'phone' => '0123456789',
                'email' => 'nguyenvana@example.com',
                'address' => 'Hà Nội',
                'numberOfOrders' => 0,
                'totalSpent' => 0,
                'status' => 'active',
                'createdAt' => now(),
                'updatedAt' => now()
            ],
            [
                'name' => 'Trần Thị B',
                'phone' => '0987654321',
                'email' => 'tranthib@example.com',
                'address' => 'Hồ Chí Minh',
                'numberOfOrders' => 0,
                'totalSpent' => 0,
                'status' => 'active',
                'createdAt' => now(),
                'updatedAt' => now()
            ],
            [
                'name' => 'Lê Văn C',
                'phone' => '0369852147',
                'email' => 'levanc@example.com',
                'address' => 'Đà Nẵng',
                'numberOfOrders' => 0,
                'totalSpent' => 0,
                'status' => 'active',
                'createdAt' => now(),
                'updatedAt' => now()
            ],
            [
                'name' => 'Phạm Thị D',
                'phone' => '0912345678',
                'email' => 'phamthid@example.com',
                'address' => 'Cần Thơ',
                'numberOfOrders' => 2,
                'totalSpent' => 1500000,
                'status' => 'active',
                'createdAt' => now(),
                'updatedAt' => now()
            ]
        ];

        foreach ($customers as $customer) {
            \App\Models\Customer::create($customer);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('customers');
    }
}; 