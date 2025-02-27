<?php

use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use MongoDB\Laravel\Eloquent\Casts\ObjectId;

// Route::get('/', function () {
//     return view('welcome');
// });

Route::get('/check-db', function () {
    try {
        DB::connection('mongodb')->command(['ping' => 1]);
        return response()->json(['message' => 'Connected to MongoDB successfully' . DB::getDatabaseName()]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Connection failed: ' . $e->getMessage()], 500);
    }
});


Route::get('/users', [UserController::class, 'index']);
