<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\RoleController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('employees', [EmployeeController::class, 'index']);
// Route::post('employee',[EmployeeController::class,'upload']);


Route::get('roles', [RoleController::class, 'index']);
Route::post('roles',[RoleController::class,'store']);
Route::put('roles/edit/{_id}',[RoleController::class,'update']);
Route::delete('roles/delete/{_id}',[RoleController::class,'destroy']);