<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

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
    //TRạng
    public function addRole(Request $request)
    {
        try {
            $validatedData = $request->validate(
                [
                    'name' => 'required|string|max:255|unique:roles,name'
                ],
                [
                    'name.unique' => 'Role đã tồn tại trong hệ thống.'
                ]
            );

            Role::create([
                'name' => $validatedData['name'],
                'deleted_at' => null,
                'updated_at' =>now(),
                'created_at' =>now()
            ]);

            return response()->json([
                'status' => 201,
                'message' => 'Role được thêm thành công!'
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 422,
                'message' => $e->getMessage()
            ], 422);
        }
    }
    public function deleRole($_id)
    {
        if($_id)
        {
            $role = Role::find($_id);

            $role->update([
                'updated_at' =>now(),
                'deleted_at' => now()
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Đã cập nhật role thành công!'
            ], 200);
        }else{
            return response()->json([
                'status' => 400,
                'message' => 'Chưa chọn Role.'
            ], 400);
        }
    }
    public function undeleRole($_id)
    {
        if($_id)
        {
            $role = Role::find($_id);

            $role->update([
                'updated_at' =>now(),
                'deleted_at' => null
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Đã cập nhật role thành công!'
            ], 200);
        }else{
            return response()->json([
                'status' => 400,
                'message' => 'Chưa chọn Role.'
            ], 400);
        }
    }
    public function GetAll()
    {
        $roles = Role::orderBy('updated_at', 'asc')->get();

        return response()->json([
            'status' => 200,
            'roles' => $roles
        ], 200);
    }
    public function GetAllnoDele()
    {
        $roles = Role::where('delete_at',null)
            ->orderBy('updated_at', 'asc')->get();

        return response()->json([
            'status' => 200,
            'roles' => $roles
        ], 200);
    }
    public function UpdateRole($_id, Request $request)
    {
        $validatedData = $request->validate(
            [
                'name' => 'required|string|max:255|unique:roles,name',
            ],
            [
                'name.unique' => 'Role đã tồn tại trong hệ thống.',
                'name.required' => 'Tên của role bị trống.'
            ]
        );

        $role = Role::find($_id);
        if($role)
        {
            $role->update([
                'name'=>$validatedData['name'],
                'updated_at'=>now()
            ]);
            return response()->json([
                'status' => 200,
                'message' =>'Cập nhật thành công.',
                'roles' => $role
            ], 200);
        }
        return response()->json([
            'status' => 404,
            'message' => 'Tìm không thấy.'
        ], 404);

    }

}
