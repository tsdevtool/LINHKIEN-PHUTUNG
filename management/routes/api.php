<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\Customers\CartController;
use App\Http\Controllers\Customers\HomeController;
use App\Http\Controllers\Admins\CategoryController;
use App\Http\Controllers\Admins\ProductController;
use App\Http\Controllers\Admins\RoleController;

use App\Http\Controllers\Admins\UserControllerAdmin;
use App\Http\Controllers\Admins\SupplierController;
use App\Http\Controllers\Admins\EmployeeController;
use App\Http\Controllers\Customers\ClientController;
use App\Http\Controllers\Employees\OrderController;
use App\Http\Middleware\AuthMiddleware;

use Illuminate\Support\Facades\Route;


Route::controller(AuthController::class)->group(function () {
    Route::post('v1/auth/signup', 'signup');
    Route::post('v1/auth/login', 'login');
    Route::post('v1/auth/logout', 'logout');
    Route::get('v1/auth/auth-check', 'authCheck');
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
    Route::post('/get', [CartController::class,'index']);
    Route::post('/', [CartController::class,'store'] );
    Route::put('/', [CartController::class,'update']);
    Route::delete('/', [CartController::class,'destroy']);
});

Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/list/for-admin-waitingconfirmation', [ProductController::class, 'getProductsForAdminWattingConfirmation']);
    Route::get('/list/for-admin-confirmation', [ProductController::class, 'getProductsForAdminConfirmation']);
    Route::get('/list/for-employee', [ProductController::class, 'getProductsForEmployee']);
    Route::get('/trash', [ProductController::class, 'getTrash']);
    Route::delete('/trash/empty', [ProductController::class, 'emptyTrash']);
    Route::post('/restore/{id}', [ProductController::class, 'restore']);
    Route::post('/request-stock-check', [ProductController::class, 'requestStockCheck']);
    Route::post('/recheck-product/{id}', [ProductController::class, 'recheckProduct']);
    Route::post('/admin-confirm-stock-check/{id}', [ProductController::class, 'confirmStockCheck']);
    Route::post('/employee-confirm-stock-check/{id}', [ProductController::class, 'employeeConfirmStockCheck']);
    
    // Routes với dynamic parameter nên đặt cuối cùng
    Route::get('/{id}', [ProductController::class, 'show']);
    Route::put('/{id}', [ProductController::class, 'update']);
    Route::delete('/soft/{id}', [ProductController::class, 'softDelete']);
    Route::delete('/{id}', [ProductController::class, 'destroy']);
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



Route::controller(SupplierController::class)->group(function () {
    Route::get('v1/suppliers', [SupplierController::class,'index']);
    Route::get('v1/supplier/{_id}', [SupplierController::class,'show']);
    Route::post('v1/supplier/', [SupplierController::class,'store']);
    Route::put('v1/supplier/edit/{_id}', [SupplierController::class,'update']);
    Route::delete('v1/supplier/delete/{_id}', [SupplierController::class,'destroy']);
});


Route::prefix('employees')->group(function () {
    Route::get('/', [EmployeeController::class, 'index']);
    Route::post('/', [EmployeeController::class, 'addEmploy']);
    Route::get('/{_id}', [EmployeeController::class, 'GetEmployee']);
    Route::delete('/{_id}', [EmployeeController::class, 'deleteEmploy']);
    Route::put('/{_id}', [EmployeeController::class, 'updateEmployee']);
    Route::put('/{_id}/undelete', [EmployeeController::class, 'unDeleteEmploy']);
});


Route::prefix('roles')->group(function () {
    Route::post('/', [RoleController::class, 'addRole']);
    Route::put('/delete/{_id}', [RoleController::class, 'deleRole']);
    Route::put('/undelete/{_id}', [RoleController::class, 'undeleRole']);
    Route::get('/', [RoleController::class, 'GetAll']);
    Route::get('/nodele', [RoleController::class, 'GetAllnoDele']);
    Route::put('/update/{_id}', [RoleController::class, 'UpdateRole']);
    Route::get('/customer', [RoleController::class, 'getCustomerRoleId']);
});
Route::prefix('users')->group(function () {

    // Thêm routes cho customer
    Route::get('/customers', [UserControllerAdmin::class, 'getAllCustomers']);
    Route::get('/customers/{_id}', [UserControllerAdmin::class, 'getCustomerById']);
    Route::post('/customers/add', [UserControllerAdmin::class, 'AddCustomer']);
    Route::post('/customers/search', [UserControllerAdmin::class, 'searchCustomers']);
    Route::put('/customers/update/{_id}', [UserControllerAdmin::class, 'UpdateCustomer']);
    Route::delete('/customers/{_id}', [UserControllerAdmin::class, 'DeleteCustomer']);

    Route::get('/employees', [UserControllerAdmin::class, 'getAllEmployee']);//lấy all
    Route::get('/employees/{_id}', [UserControllerAdmin::class, 'getEmployeeByID']);//lấy theo id
    Route::post('/employees/add', [UserControllerAdmin::class, 'AddEmployee']);//add thêm nhân viên
    Route::post('/employees/search', [UserControllerAdmin::class, 'getEmployee']);//get nhân viên theo tên hoặc theo idrole
    Route::put('/employees/update/{_id}', [UserControllerAdmin::class, 'UpdateEmployee']);//chỉnh sửa
    Route::delete('/employees/{_id}', [UserControllerAdmin::class, 'DeleteEmployee']);//delete theo id
    Route::put('/employees/undelete/{_id}', [UserControllerAdmin::class, 'UnDeleteEmployee']);

});



Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/find-by-number/{orderNumber}', [OrderController::class, 'findByOrderNumber']);
        Route::put('/update-by-number/{orderNumber}', [OrderController::class, 'updateByOrderNumber']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::put('/{id}', [OrderController::class, 'update']);
        Route::post('/{id}/payment', [OrderController::class, 'createPayment']);
        Route::post('/payment/webhook', [OrderController::class, 'handleWebhook']);
        Route::put('/{id}/cancel', [OrderController::class, 'cancel']);
   
});

// Customer Management
Route::prefix('users/customers')->group(function () {
    Route::get('/', [UserControllerAdmin::class, 'getAllCustomers']);
    Route::get('/active', [UserControllerAdmin::class, 'getActiveCustomers']);
    Route::get('/inactive', [UserControllerAdmin::class, 'getInactiveCustomers']);
    Route::get('/{id}', [UserControllerAdmin::class, 'getCustomerById']);
    Route::post('/', [UserControllerAdmin::class, 'AddCustomer']);
    Route::post('/search', [UserControllerAdmin::class, 'searchCustomers']);
    Route::put('/{id}', [UserControllerAdmin::class, 'UpdateCustomer']);
    Route::delete('/{id}', [UserControllerAdmin::class, 'DeleteCustomer']);
    Route::put('/status/{id}/{type}', [UserControllerAdmin::class, 'updateCustomerStatus']);
});

// Employee Management
Route::prefix('users/employees')->group(function () {
    Route::get('/', [UserControllerAdmin::class, 'getAllEmployee']);
    Route::get('/{id}', [UserControllerAdmin::class, 'getEmployeeByID']);
    Route::post('/', [UserControllerAdmin::class, 'AddEmployee']);
    Route::post('/search', [UserControllerAdmin::class, 'getEmployee']);
    Route::put('/{id}', [UserControllerAdmin::class, 'UpdateEmployee']);
    Route::delete('/{id}', [UserControllerAdmin::class, 'DeleteEmployee']);
});


// Customer Order Routes
Route::prefix('customer/orders')->middleware(AuthMiddleware::class)->group(function () {
    Route::get('/', [App\Http\Controllers\Customers\OrderController::class, 'index']);
    Route::get('/{id}', [App\Http\Controllers\Customers\OrderController::class, 'show']);
    Route::post('/create-from-cart', [App\Http\Controllers\Customers\OrderController::class, 'createFromCart']);
    Route::delete('/{id}/cancel', [App\Http\Controllers\Customers\OrderController::class, 'cancel']);
});

// PayOS Webhook route
Route::post('/v1/orders/payment/webhook', [OrderController::class, 'handleWebhook']);

// Debug route - REMOVE IN PRODUCTION
Route::get('/debug/payos', function () {
    return [
        'PAYOS_CLIENT_ID' => env('PAYOS_CLIENT_ID') ? 'set' : 'not set',
        'PAYOS_API_KEY' => env('PAYOS_API_KEY') ? 'set' : 'not set',
        'PAYOS_CHECKSUM_KEY' => env('PAYOS_CHECKSUM_KEY') ? 'set' : 'not set',
        'PAYOS_WEBHOOK_URL' => env('PAYOS_WEBHOOK_URL') ?: 'not set',
        'BACKEND_URL' => env('BACKEND_URL') ?: 'not set'
    ];
});