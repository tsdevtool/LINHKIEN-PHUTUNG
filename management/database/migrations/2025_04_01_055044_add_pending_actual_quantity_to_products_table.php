<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->integer('pending_actual_quantity')->nullable();
        });
          // Cập nhật các bản ghi cũ, gán giá trị mặc định cho trường `pending_actual_quantity`
          DB::table('products')->update(['pending_actual_quantity' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('pending_actual_quantity'); 
        });
    }
};
