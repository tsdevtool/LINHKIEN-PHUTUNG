<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Exception;

class AuthController extends Controller
{
    public function signup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|unique:users',
            'password' => 'required|min:6',
            'firstname' => 'required',
            'lastname' => 'required',
            'email' => 'nullable|email',
            'idrole' => 'required|exists:roles,_id'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 400);
        }
        try {
            $hashedPassword = Hash::make($request->password);
            $image = "https://avatar.iran.liara.run/username?username=" . $request->firstname;

            $user = User::create([
                'firstname' => $request->firstname,
                'lastname' => $request->lastname,
                'phone' => $request->phone,
                'email' => $request->email,
                'password' => $hashedPassword,
                'image' => $image,
                'idrole' => $request->idrole
            ]);

            // Get role name for token
            $role = Role::find($user->idrole);
            if (!$role) {
                throw new Exception('Role not found');
            }

            $token = $this->generateTokenAndSetCookie($user->_id, $role->name);

            // Load role relationship for response
            $user = User::with('role')->find($user->_id);

            return response()->json([
                'success' => true, 
                'user' => $user, 
                'token' => $token
            ], 201)->withCookie(
                cookie('jwt-phutung', $token, 15 * 24 * 60, '/', null, false, true)
            );
        
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false, 
                'message' => 'Lỗi server: ' . $th->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $credentials = $request->only('phone', 'password');

        $user = User::with('role')->where('phone', $credentials['phone'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['success' => false, 'message' => 'Sai số điện thoại hoặc mật khẩu'], 400);
        }

        if (!$user->role) {
            return response()->json(['success' => false, 'message' => 'User role not found'], 400);
        }

        $token = $this->generateTokenAndSetCookie($user->_id, $user->role->name);

        return response()->json([
            'success' => true, 
            'user' => $user, 
            'token' => $token
        ])->withCookie(
            cookie('jwt-phutung', $token, 15 * 24 * 60, '/', null, false, true)
        );
    }

    public function logout(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công'
        ])->withCookie(cookie()->forget('jwt-phutung'));
    }

    public function authCheck()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            // Load role relationship
            $user = User::with('role')->find($user->_id);

            if (!$user || !$user->role) {
                return response()->json([
                    'success' => false,
                    'message' => 'User role not found'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Authenticated',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication check failed: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generateTokenAndSetCookie($userId, $roleName)
    {
        $key = env('JWT_SECRET');

        if (!$key || !is_string($key)) {
            throw new \Exception("JWT_SECRET không hợp lệ hoặc không phải là chuỗi.");
        }

        $payload = [
            'userId' => (string)$userId,
            'role' => $roleName,
            'iat' => time(),
            'exp' => time() + (15 * 24 * 60 * 60) // 15 ngày
        ];

        $token = JWT::encode($payload, $key, 'HS256');

        Cookie::queue(
            'jwt-phutung', 
            $token, 
            15 * 24 * 60,
            '/', 
            null, 
            false,
            true,
            false,
            'Lax'
        );

        return $token;
    }
}
