<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

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
