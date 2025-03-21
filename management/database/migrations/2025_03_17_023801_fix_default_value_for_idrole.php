<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

class FixDefaultValueForIdrole extends Migration // Đổi tên class
{
    public function up()
    {
        DB::table('users', function (Blueprint $table) {
            $table->string('idrole')->nullable()->default(null)->change();
        });
    }

    public function down()
    {
        DB::table('users', function (Blueprint $table) {
            $table->string('idrole')->nullable(false)->change();
        });
    }
}
