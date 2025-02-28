<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(){
        $users = User::all();
        $data=[
            'status'=>200,
            'users'=> $users
        ];
        return response()->json($data, 200);
    }

    public function show($_id){
        $user = User::find($_id);
        $data = [
            'status'=> 200,
            'users'=> $user
        ];
        return response()->json($data, 200);
    }

    public function destroy($_id){
        $user = User::find($_id);
        if(!$user){
            return response()->json("Không tìm thấy người dùng",404);
        }
        if($user->delete()){
            return response()->json("Thực hiện xoá người dùng thành công",200);
        }
        return response()->json("Xoá người dùng thất bại",500);
    }
}
