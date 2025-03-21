<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // Cập nhật tất cả idrole thành NULL
        DB::table('users')->update(['idrole' => null]);
    }

    public function down()
    {
        // Nếu cần rollback, có thể đặt giá trị mặc định thành 'user' hoặc giá trị cũ
        DB::table('users')->update(['idrole' => 'user']);
    }
};
