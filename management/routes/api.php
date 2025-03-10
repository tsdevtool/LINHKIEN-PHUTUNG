<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AuthMiddleware;

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\HomeController;

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });
Route::post('/upload', [UploadController::class, 'uploadImage']);

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

Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/trash', [ProductController::class, 'getTrash']); // Thêm route mới
    Route::get('/{id}', [ProductController::class, 'show']);
    Route::post('/', [ProductController::class, 'store']);
    Route::put('/{id}', [ProductController::class, 'update']);
    Route::delete('/soft/{id}', [ProductController::class, 'softDelete']);
    Route::delete('/{id}', [ProductController::class, 'destroy']);
    Route::delete('/trash/empty', [ProductController::class, 'emptyTrash']);
    Route::post('/restore/{id}', [ProductController::class, 'restore']);
});

Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/trash', [CategoryController::class, 'getTrashedCategories']);
    Route::get('/{id}', [CategoryController::class, 'show']);
    Route::post('/', [CategoryController::class, 'store']);
    Route::put('/{id}', [CategoryController::class, 'update']);
    Route::delete('/trash/{id}', [CategoryController::class, 'forceDelete']);
    Route::delete('/{id}', [CategoryController::class, 'destroy']);
    Route::post('/{id}/move', [CategoryController::class, 'moveCategory']);
    Route::post('/restore/{id}', [CategoryController::class, 'restore']);
});

Route::prefix('home')->group(function () {
    Route::get('/', [HomeController::class, 'getHomeCategories']);
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
