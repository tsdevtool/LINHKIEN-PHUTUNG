<?php

use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\RoleController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::controller(UserController::class)->group(function () {
    Route::get('users', [UserController::class,'index']);
    Route::get('user/{_id}', [UserController::class,'show']);
    Route::delete('user/delete/{_id}', [UserController::class,'destroy']);
});

Route::get('employees', [EmployeeController::class, 'index']);
// Route::post('employee',[EmployeeController::class,'upload']);

Route::controller(RoleController::class)->group(function () {
    Route::get('roles', 'index');
    Route::post('roles', 'store');
    Route::put('roles/edit/{_id}', 'update');
    Route::delete('roles/delete/{_id}', 'destroy');
});