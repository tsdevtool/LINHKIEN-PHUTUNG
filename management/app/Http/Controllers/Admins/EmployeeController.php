<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Exception;

class EmployeeController extends Controller
{

    public function index(){
        $employee = Employee::all();
        $data = [
            'status' => 200,
            'employee' => $employee
        ];
        return response()->json($data,200);
    }
}
