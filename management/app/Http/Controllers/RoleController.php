<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
    public function index(){
        $roles = Role::all();
        $data=[
            "status"=>200,
            "roles"=> $roles
        ];
        return response()->json($data);
    }

    public function store(Request $request){
        $validator = Validator::make($request->all(),[
            'name'=>'required'
        ]);
        if($validator->fails()){
            $data=[
                'status'=> 422,
                'message'=> $validator->messages(),
            ];
            return response()->json($data,200);
        }else{
            $role = new Role();
            $role->name = $request->name;
            $role->save();
            $data=[
                'status'=> 200,
                'message'=> 'Đã tạo thành công: ' . $request->name
            ];
            return response()->json($data,200);
        }
    }

    public function update(Request $request, $_id){
        $validator = Validator::make($request->all(),[
            'name'=>'required'
        ]);
        if($validator->fails()){
            $data=[
                'status'=> 422,
                'message'=> $validator->messages(),
            ];
            return response()->json($data,422);
        }else{
            $role = Role::find($_id);

            $role->name = $request->name;
            $role->save();
            $data=[
                'status'=> 200,
                'message'=> 'Đã chỉnh sửa thành công: ' . $request->name
            ];
            return response()->json($data,200);
        }
    }

    public function destroy($_id){
        $role = Role::find($_id);
        if($role){
            $role->delete();
            $data=[
                'status'=> 200,
                'message'=> 'Đã xoá thành công'
            ];
            return response()->json($data,200);
        }else{
            $data=[
                'status'=> 422,
                'message'=> 'Không tìm thấy ' . $_id . " để xoá"
            ];
            return response()->json($data,422);
        }
    }
}
