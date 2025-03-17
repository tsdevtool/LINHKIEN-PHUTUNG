<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddIdroleToUsers extends Migration
{
    public function up()
    {
        // Thêm field 'idrole' với giá trị mặc định là 'user' vào tất cả users
        DB::table('users')->update([
            'idrole' => 'user'
        ]);
    }

    public function down()
    {
        // Xóa field 'idrole' khỏi tất cả users khi rollback
        DB::table('users')->update([
            'idrole' => null
        ]);
    }


};
