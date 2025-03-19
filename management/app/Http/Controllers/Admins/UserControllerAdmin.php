<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Exception;
use Carbon\Carbon;
use Symfony\Component\CssSelector\Node\FunctionNode;

class UserControllerAdmin extends Controller
{
    //employee
    public function getAllEmployee()
    {
        try {

            //$roleIds = Role::where('name','!=' ,'customer')->pluck('_id');
            $roles = Role::select('_id')
                ->where('name', '!=', 'customer')
                ->get();
            // $roles: Collection các Role, mỗi role chỉ có trường _id
            $roleIds = $roles->map(fn($role) => $role->_id);
            $users = User::whereIn('idrole', $roleIds)
                        ->whereNull('deleted_at')
                        ->get();


            if ($users->isEmpty()) {
                return response()->json([
                    'status'  => 404,
                    'idrole' => $roleIds,
                    'message' => 'Không tìm thấy nhân viên nào.'
                ], 404);
            }

            return response()->json([
                'status'  => 200,
                'message' => 'Lấy dữ liệu thành công.',
                'users'   => $users
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 500,
                'message' => 'Lỗi server: ' . $e->getMessage()
            ], 500);
        }
    }
    public function AddEmployee(Request $request)
    {
        try {
            // Xác thực dữ liệu đầu vào cho user
            $validatedData = $request->validate([
                'firstname'      => 'required|string|max:255',
                'lastname'       => 'required|string|max:255',
                'phone'          => 'required|string|max:10|unique:users,phone',
                'username'       => 'required|string|max:255|unique:users,username',
                'password'       => 'required|string|min:6',
                'address'        => 'nullable|string',
                'image'          => 'nullable|string',
                'numberOfOrder'  => 'nullable|integer',
                'numberOfOrders' => 'nullable|integer',
                'totalSpent'     => 'nullable|numeric',
                'idrole'         => 'required',
                'status'         => 'nullable|boolean',
            ], [
                'firstname.required' => 'Firstname không được để trống.',
                'lastname.required'  => 'Lastname không được để trống.',
                'phone.required'     => 'Phone không được để trống.',
                'phone.unique'       => 'Số điện thoại đã tồn tại.',
                'username.required'  => 'Username không được để trống.',
                'username.unique'    => 'Username đã tồn tại.',
                'password.required'  => 'Password không được để trống.',
                // Bạn có thể thêm các thông báo lỗi khác tương tự...
            ]);

            // Mã hóa mật khẩu
            $validatedData['password'] = bcrypt($validatedData['password']);

            // Gộp dữ liệu validated với các trường bổ sung
            $data = array_merge($validatedData, [
                'created_at' => now()->setTimezone('Asia/Ho_Chi_Minh'),
                'updated_at' => now()->setTimezone('Asia/Ho_Chi_Minh'),
                'deleted_at' => null
            ]);

            // Tạo user mới
            $user = User::create($data);

            return response()->json([
                'status'  => 201,
                'message' => 'User đã được thêm thành công!',
                'user'    => $user
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status'  => 422,
                'message' => 'Lỗi xác thực thông tin.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 500,
                'message' => 'Đã xảy ra lỗi khi thêm user.',
                'error'   => $e->getMessage()
            ], 500);
        }

    }


    //customer
}
?>
