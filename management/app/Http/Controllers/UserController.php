<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(){
        try{
            $users = User::all();
        return response()->json($users);
        }catch(\Exception $e){
            return response()->json([
                'message' => 'Lỗi khi tìm thông tin users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
