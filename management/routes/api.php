<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SupplierController;
use App\Models\Category;
use App\Models\Product;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::controller(UserController::class)->group(function () {
    Route::get('users', [UserController::class,'index']);
    Route::get('user/{_id}', [UserController::class,'show']);
    Route::delete('user/delete/{_id}', [UserController::class,'destroy']);
});

Route::controller(ProductController::class)->group(function () {
    Route::get('products', [ProductController::class,'index']);
    Route::get('product/{_id}', [ProductController::class,'show']);
    Route::post('product/', [ProductController::class,'store']);
    Route::put('product/edit/{_id}', [ProductController::class,'update']);
    Route::delete('product/delete/{_id}', [ProductController::class,'destroy']);
});

Route::controller(CategoryController::class)->group(function () {
    Route::get('categories', [CategoryController::class,'index']);
    Route::get('category/{_id}', [CategoryController::class,'show']);
    Route::post('category/', [CategoryController::class,'store']);
    Route::put('category/edit/{_id}', [CategoryController::class,'update']);
    Route::delete('category/delete/{_id}', [CategoryController::class,'destroy']);
});

Route::controller(SupplierController::class)->group(function () {
    Route::get('suppliers', [SupplierController::class,'index']);
    Route::get('supplier/{_id}', [SupplierController::class,'show']);
    Route::post('supplier/', [SupplierController::class,'store']);
    Route::put('supplier/edit/{_id}', [SupplierController::class,'update']);
    Route::delete('supplier/delete/{_id}', [SupplierController::class,'destroy']);
});

Route::get('employees', [EmployeeController::class, 'index']);
// Route::post('employee',[EmployeeController::class,'upload']);

Route::controller(RoleController::class)->group(function () {
    Route::get('roles', 'index');
    Route::post('roles', 'store');
    Route::put('roles/edit/{_id}', 'update');
    Route::delete('roles/delete/{_id}', 'destroy');
});