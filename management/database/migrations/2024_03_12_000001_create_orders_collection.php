<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;

return new class extends Migration
{
    public function up(): void
    {
        // Chỉ tạo collection nếu chưa tồn tại
        if (!Schema::connection('mongodb')->hasTable('orders')) {
            Schema::connection('mongodb')->create('orders', function (Blueprint $collection) {
                $collection->unique(['order_number']); // Đảm bảo mã đơn hàng là duy nhất
                $collection->index('user_id');
                $collection->index('status');
                $collection->index('created_at');
            });
        } else {
            // Nếu collection đã tồn tại, chỉ cập nhật indexes
            $collection = Schema::connection('mongodb')->collection('orders');
            
            // Xóa index cũ nếu có
            try {
                $collection->dropIndex('orderNumber_1');
            } catch (\Exception $e) {
                // Bỏ qua nếu index không tồn tại
            }
            
            // Tạo index mới
            $collection->unique(['order_number']);
            $collection->index('user_id');
            $collection->index('status');
            $collection->index('created_at');
        }
    }

    public function down(): void
    {
        // Không xóa collection trong trường hợp rollback
        // Schema::connection('mongodb')->dropIfExists('orders');
    }
}; 