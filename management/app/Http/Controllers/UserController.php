<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Exception;

class UserController extends Controller
{

    public function index()
    {
        try {
            $users = User::all();
            return response()->json([
                'success' => true,
                'users' => $users
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show($_id)
    {
        try {
            $user = User::find($_id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => "Không tìm thấy người dùng",
                ], 404);
            }

            return response()->json([
                'success' => true,
                'users' => $user
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($_id)
    {
        try {
            $user = User::find($_id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => "Không tìm thấy người dùng",
                ], 404);
            }

            if ($user->delete()) {
                return response()->json([
                    'success' => true,
                    'message' => "Thực hiện xoá người dùng thành công",
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => "Xoá người dùng thất bại",
            ], 500);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }
}
