<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\Customers\CartController;
use App\Http\Controllers\Customers\HomeController;
use App\Http\Controllers\Admins\CategoryController;
use App\Http\Controllers\Admins\ProductController;
use App\Http\Controllers\Admins\RoleController;
use App\Http\Controllers\Admins\CustomerAdminController;
use App\Http\Controllers\Admins\UserControllerAdmin;
use App\Http\Controllers\Admins\SupplierController;
use App\Http\Controllers\Admins\EmployeeController;
use App\Http\Controllers\Customers\ClientController;
use App\Http\Controllers\Employees\CustomerController;
use App\Http\Controllers\Employees\OrderController;
use App\Http\Middleware\AuthMiddleware;

use Illuminate\Support\Facades\Route;

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::controller(AuthController::class)->group(function () {
    Route::post('v1/auth/signup', 'signup');
    Route::post('v1/auth/login', 'login');
    Route::post('v1/auth/logout', 'logout');
    Route::get('v1/auth/auth-check', 'authCheck')->middleware(AuthMiddleware::class);
});

//Customer
Route::prefix('home')->group(function () {
    Route::get('/', [HomeController::class, 'getHomeCategories']);
});

Route::prefix('client')->group(function () {
    Route::get('/{id}/detail-product', [ClientController::class, 'showDetailProduct']);

    Route::get('/{category_id}/get-all', [ClientController::class, 'showListProductFollowCategory']);

    Route::get('/{category_id}/category', [ClientController::class, 'showListProductFollowChildCategory']);
});

Route::prefix('cart')->middleware(AuthMiddleware::class)->group(function () {
    Route::post('/', [CartController::class,'index']);
    Route::post('/', [CartController::class,'store'] );
    Route::put('/', [CartController::class,'update']);
    Route::delete('/', [CartController::class,'destroy']);
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

Route::prefix('customers')->group(function () {
    Route::get('/', [CustomerController::class, 'index']);
    Route::get('/search', [CustomerController::class, 'search']);
    Route::get('/{id}', [CustomerController::class, 'show']);
    Route::post('/', [CustomerController::class, 'store']);
    Route::put('/{id}', [CustomerController::class, 'update']);
    Route::delete('/{id}', [CustomerController::class, 'destroy']);
});

// Route::controller(UserController::class)->group(function () {
//     Route::get('v1/users', [UserController::class,'index']);
//     Route::get('v1/user/{_id}', [UserController::class,'show']);
//     Route::delete('v1/user/delete/{_id}', [UserController::class,'destroy']);
// });

Route::controller(SupplierController::class)->group(function () {
    Route::get('v1/suppliers', [SupplierController::class,'index']);
    Route::get('v1/supplier/{_id}', [SupplierController::class,'show']);
    Route::post('v1/supplier/', [SupplierController::class,'store']);
    Route::put('v1/supplier/edit/{_id}', [SupplierController::class,'update']);
    Route::delete('v1/supplier/delete/{_id}', [SupplierController::class,'destroy']);
});

// Route::get('employees', [EmployeeController::class, 'index']);
// Route::delete('employees/{_id}', [EmployeeController::class, 'deleteEmploy']);
// Route::post('/employees', [EmployeeController::class, 'addEmploy']);
// Route::put('employees/{_id}', [EmployeeController::class, 'unDeleteEmploy']);
// Route::put('employees/{_id}', [EmployeeController::class, 'updateEmployee']);
Route::prefix('employees')->group(function () {
    Route::get('/', [EmployeeController::class, 'index']);
    Route::post('/', [EmployeeController::class, 'addEmploy']);
    Route::get('/{_id}', [EmployeeController::class, 'GetEmployee']);
    Route::delete('/{_id}', [EmployeeController::class, 'deleteEmploy']);
    Route::put('/{_id}', [EmployeeController::class, 'updateEmployee']);
    Route::put('/{_id}/undelete', [EmployeeController::class, 'unDeleteEmploy']);
});
Route::prefix('customersadmin')->group(function () {
    Route::get('/active', [CustomerAdminController::class, 'GetAllCustomer']);
    Route::get('/unactive', [CustomerAdminController::class, 'GetAllCustomer_unActive']);
    Route::put('/status/{_id}/{type}', [CustomerAdminController::class, 'Block_Active']);
});

Route::prefix('roles')->group(function () {
    Route::post('/', [RoleController::class, 'addRole']);
    Route::put('/delete/{_id}', [RoleController::class, 'deleRole']);
    Route::put('/undelete/{_id}', [RoleController::class, 'undeleRole']);
    Route::get('/', [RoleController::class, 'GetAll']);
    Route::get('/nodele', [RoleController::class, 'GetAllnoDele']);
    Route::put('/update/{_id}', [RoleController::class, 'UpdateRole']);

});
Route::prefix('users')->group(function () {
    Route::get('/employees', [UserControllerAdmin::class, 'getAllEmployee']);
    Route::post('/employees/add', [UserControllerAdmin::class, 'AddEmployee']);
});

// Route::post('employee',[EmployeeController::class,'upload']);

// Route::controller(RoleController::class)->group(function () {
//     Route::get('v1/roles', 'index');
//     Route::post('v1/roles', 'store');
//     Route::put('v1/roles/edit/{_id}', 'update');
//     Route::delete('v1/roles/delete/{_id}', 'destroy');
//     Route::post('v1/roles', 'store');
// });

Route::prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index']);
    Route::post('/', [OrderController::class, 'store']);
    Route::get('/{id}', [OrderController::class, 'show']);
    Route::put('/{id}', [OrderController::class, 'update']);
});
