<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AuthMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SupplierController;
use App\Models\Category;
use App\Models\Product;

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::controller(AuthController::class)->group(function () {
    Route::post('v1/auth/signup', 'signup');
    Route::post('v1/auth/login', 'login');
    Route::post('v1/auth/logout', 'logout');
    Route::get('v1/auth/auth-check', 'authCheck')->middleware(AuthMiddleware::class);
});

Route::controller(UserController::class)->group(function () {
    Route::get('v1/users', [UserController::class,'index']);
    Route::get('v1/user/{_id}', [UserController::class,'show']);
    Route::delete('v1/user/delete/{_id}', [UserController::class,'destroy']);
});

Route::controller(ProductController::class)->group(function () {
    Route::get('v1/products', [ProductController::class,'index']);
    Route::get('v1/product/{_id}', [ProductController::class,'show']);
    Route::post('v1/product/', [ProductController::class,'store']);
    Route::put('v1/product/edit/{_id}', [ProductController::class,'update']);
    Route::delete('v1/product/delete/{_id}', [ProductController::class,'destroy']);
});

Route::controller(CategoryController::class)->group(function () {
    Route::get('v1/categories', [CategoryController::class,'index']);
    Route::get('v1/category/{_id}', [CategoryController::class,'show']);
    Route::post('v1/category/', [CategoryController::class,'store']);
    Route::put('v1/category/edit/{_id}', [CategoryController::class,'update']);
    Route::delete('v1/category/delete/{_id}', [CategoryController::class,'destroy']);
});

Route::controller(SupplierController::class)->group(function () {
    Route::get('v1/suppliers', [SupplierController::class,'index']);
    Route::get('v1/supplier/{_id}', [SupplierController::class,'show']);
    Route::post('v1/supplier/', [SupplierController::class,'store']);
    Route::put('v1/supplier/edit/{_id}', [SupplierController::class,'update']);
    Route::delete('v1/supplier/delete/{_id}', [SupplierController::class,'destroy']);
});

Route::get('employees', [EmployeeController::class, 'index']);
// Route::post('employee',[EmployeeController::class,'upload']);

Route::controller(RoleController::class)->group(function () {
    Route::get('v1/roles', 'index');
    Route::post('v1/roles', 'store');
    Route::put('v1/roles/edit/{_id}', 'update');
    Route::delete('v1/roles/delete/{_id}', 'destroy');
});
