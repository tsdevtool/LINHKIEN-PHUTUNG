<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Exception;
use Carbon\Carbon;
use Symfony\Component\CssSelector\Node\FunctionNode;

use function PHPUnit\Framework\isEmpty;

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
    public function getEmployeeByID($_id)
    {
        $em = User::find($_id);
        if(!$em)
        {
            return response()->json([
                'status'  => 404,
                'message' => 'Không tìm thấy nhân viên.'
            ], 404);
        }else{
            return response()->json([
                'status'  => 200,
                'message' => 'Lấy dữ liệu thành công.',
                'employee' => $em
            ], 200);
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
    public function getEmployee(Request $request)
    {
        $nameEmploy = $request->input('nameEmploy'); // Lấy dữ liệu từ body
        $IdRole = $request->input('IdRole'); // Có thể null

        if ($nameEmploy === null && $IdRole === null) {
            return response()->json([
                'status'  => 422,
                'message' => 'Lỗi thông tin đầu vào.'
            ], 422);
        }

        $query = User::query();

        if (!empty($nameEmploy)) {
            $nameEmployLower = strtolower($nameEmploy);

            $query->whereRaw([
                '$expr' => [
                    '$or' => [
                        ['$eq' => [['$toLower' => '$firstname'], $nameEmployLower]],
                        ['$eq' => [['$toLower' => '$lastname'], $nameEmployLower]]
                    ]
                ]
            ]);
        }

        if (!empty($IdRole)) {
            $query->where('idrole', $IdRole);
        }

        $employees = $query->get();

        if ($employees->isEmpty()) {
            return response()->json([
                'status'  => 404,
                'message' => 'Không tìm thấy nhân viên.'
            ], 404);
        }

        return response()->json([
            'status'   => 200,
            'message'  => 'Thành công.',
            'data'     => $employees
        ], 200);
    }

    public function UpdateEmployee(Request $request, $_id)
    {
        try {
            // Tìm user theo ID
            $user = User::find($_id);
            if (!$user) {
                return response()->json([
                    'status'  => 404,
                    'message' => 'Không tìm thấy nhân viên.'
                ], 404);
            }

            // Xác thực dữ liệu đầu vào
            $validatedData = $request->validate([
                'firstname'      => 'nullable|string|max:255',
                'lastname'       => 'nullable|string|max:255',
                'phone'          => 'nullable|string|max:10',
                'username'       => 'nullable|string|max:255|unique:users,username,' . $_id,
                'password'       => 'nullable|string|min:6',
                'address'        => 'nullable|string',
                'image'          => 'nullable|string',
                'numberOfOrder'  => 'nullable|integer',
                'numberOfOrders' => 'nullable|integer',
                'totalSpent'     => 'nullable|numeric',
                'idrole'         => 'nullable',
                'status'         => 'nullable|boolean',
            ], [
                'username.unique'  => 'Username đã tồn tại.',
            ]);

            // Mã hóa mật khẩu nếu có thay đổi
            if (!empty($validatedData['password'])) {
                $validatedData['password'] = bcrypt($validatedData['password']);
            } else {
                unset($validatedData['password']);
            }
            $user->update($validatedData,
            [
                'updated_at' => now()->setTimezone('Asia/Ho_Chi_Minh'),
                'deleted_at' => null
            ]);

            return response()->json([
                'status'  => 200,
                'message' => 'User đã được cập nhật thành công!',
                'user'    => $user
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status'  => 422,
                'message' => 'Lỗi xác thực thông tin.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 500,
                'message' => 'Đã xảy ra lỗi khi cập nhật user.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function DeleteEmployee($_id)
    {
        $em = User::find($_id);
        if(!$em)
        {
            return response()->json([
                'status'  => 404,
                'message' => 'Không tìm thấy nhân viên.'
            ], 404);
        }else{
            $em->update([
                'status' => false,
                'deleted_at'=>now()
            ]);
            return response()->json([
                'status'  => 201,
                'message' => 'Cập nhật dữ liệu thành công.'
            ], 201);
        }
    }


    //customer
}
?>
