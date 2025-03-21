<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Exception;
use Carbon\Carbon;
class EmployeeController extends Controller
{

    public function index(){
        $employees = Employee::where('deleted_at','')
            ->get()
            ->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->name,
                'phone' => $employee->phone,
                'email' => $employee->email,
                'role_id' => $employee->role_id,
                'username' => $employee->username,
                'created_at' => Carbon::parse($employee->created_at)->setTimezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::parse($employee->updated_at)->setTimezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'status' => 200,
            'employees' => $employees
        ], 200);
    }
    public function deleteEmploy(string $_id)
    {
        $employee = Employee::find($_id);
        if (!$employee) {
            return response()->json([
                'status' => 404,
                'message' => 'Không tìm thấy nhân viên'
            ], 404);
        }
        $employee->update([
            'deleted_at' =>  now()->setTimezone('Asia/Ho_Chi_Minh')
        ]);
        return response()->json([
            'status' => 200,
            'message' => 'Cập nhật thành công!'
        ], 200);
    }
    public function addEmploy(Request $request)
    {
        try {
            // Xác thực dữ liệu đầu vào
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'phone' => 'required|string|max:15',
                'email' => 'required|email|unique:employees,email',
                'role_id' => 'required|string',
                'username' => 'required|string|unique:employees,username',
                'password' => 'required|string|min:6',
            ], [
                'name.required' => 'Tên nhân viên không được để trống.',
                'name.string' => 'Tên nhân viên phải là chuỗi.',
                'name.max' => 'Tên nhân viên tối đa 255 ký tự.',

                'phone.required' => 'Số điện thoại không được để trống.',
                'phone.string' => 'Số điện thoại phải là chuỗi.',
                'phone.max' => 'Số điện thoại tối đa 15 ký tự.',

                'email.required' => 'Email không được để trống.',
                'email.email' => 'Email không đúng định dạng.',
                'email.unique' => 'Email đã tồn tại trong hệ thống.',

                'role_id.required' => 'Vai trò không được để trống.',
                'role_id.string' => 'Vai trò phải là chuỗi.',

                'username.required' => 'Tên đăng nhập không được để trống.',
                'username.string' => 'Tên đăng nhập phải là chuỗi.',
                'username.unique' => 'Tên đăng nhập đã tồn tại.',

                'password.required' => 'Mật khẩu không được để trống.',
                'password.string' => 'Mật khẩu phải là chuỗi.',
                'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
            ]);
            // Tạo mới nhân viên
            $employee = Employee::create([
                'name' => $validatedData['name'],
                'phone' => $validatedData['phone'],
                'email' => $validatedData['email'],
                'role_id' => $validatedData['role_id'],
                'username' => $validatedData['username'],
                'password' => bcrypt($validatedData['password']),
                'created_at' => now()->setTimezone('Asia/Ho_Chi_Minh'),
                'updated_at' => now()->setTimezone('Asia/Ho_Chi_Minh'),
                'deleted_at'=>''
            ]);

            return response()->json([
                'status' => 201,
                'message' => 'Nhân viên đã được thêm thành công!',
                'employee' => $employee
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 422,
                'message' => 'Lỗi xác thực thông tin.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Đã xảy ra lỗi khi thêm nhân viên.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function unDeleteEmploy(string $_id)
    {
        $employee = Employee::find($_id);
        if (!$employee) {
            return response()->json([
                'status' => 404,
                'message' => 'Không tìm thấy nhân viên'
            ], 404);
        }
        $employee->update([
            'deleted_at' => ''
        ]);
        return response()->json([
            'status' => 200,
            'message' => 'Cập nhật thành công!'
        ], 200);
    }
    public function updateEmployee(Request $request, $_id)
    {
        try {
            // Xác thực dữ liệu đầu vào
            $validatedData = $request->validate([
                'name' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:15',
                'email' => 'nullable|email|unique:employees,email,' . $_id,
                'role_id' => 'nullable|string',
                'username' => 'nullable|string|unique:employees,username,' . $_id,
                'password' => 'nullable|string|min:6',
            ]);

            // Tìm nhân viên theo ID
            $employee = Employee::findOrFail($_id);

            // Cập nhật thông tin nhân viên
            $employee->update([
                'name' => $validatedData['name'],
                'phone' => $validatedData['phone'],
                'email' => $validatedData['email'],
                'role_id' => $validatedData['role_id'],
                'username' => $validatedData['username'],
                'password' => $request->filled('password') ? bcrypt($validatedData['password']) : $employee->password,
                'updated_at' => now()->setTimezone('Asia/Ho_Chi_Minh'),
            ]);

            return response()->json([
                'status' => 200,
                'message' => 'Nhân viên đã được cập nhật thành công!',
                'employee' => $employee
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 422,
                'message' => 'Lỗi xác thực dữ liệu.'
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Không tìm thấy hoặc xảy ra lỗi khi cập nhật nhân viên.'
            ], 500);
        }
    }
    public function GetEmployee($_id)
    {
        if ($_id) {
            $employee = Employee::where('_id', $_id)
                ->where('deleted_at', '')
                ->get();

            if ($employee->isEmpty()) {
                return response()->json([
                    'status' => 404,
                    'message' => "Không tìm thấy nhân viên."
                ], 404);
            } else {
                return response()->json([
                    'status' => 200,
                    'employee' => $employee
                ], 200);
            }
        }

        return response()->json([
            'status' => 400,
            'message' => 'Thiếu ID hoặc ID không hợp lệ.'
        ], 400);
    }

}
