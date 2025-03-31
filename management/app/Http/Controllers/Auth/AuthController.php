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
use Illuminate\Support\Facades\Log;

use function PHPUnit\Framework\isEmpty;

class AuthController extends Controller
{
    public function signup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|unique:users',
            'password' => 'required|min:6',
            'firstname' => 'required',
            'lastname' => 'required',
            'email' => 'nullable|email'
        ]);

        $roleId = Role::where('name', 'EMPLOYEE')
            ->where('deleted_at', null)
            ->value('_id');  // Lấy trực tiếp giá trị _id dưới dạng chuỗi

        // Kiểm tra nếu không tìm thấy bất kỳ _id nào
        if (is_null($roleId)) {  // Vì value() trả về null nếu không tìm thấy
        return response()->json(['success' => false, 'message' => 'Không tìm thấy quyền hạn nhân viên! Hãy quay lại sau'], 400);
        }

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
                'address' => '',
                'image' => $image,
                'numberOfOrder'  => null,
                'numberOfOrders' => null,
                'totalSpent'     => null,
                'status' => true,
                'idrole' => $roleId,
                'created_at' => now()->setTimezone('Asia/Ho_Chi_Minh'),
                'updated_at' => now()->setTimezone('Asia/Ho_Chi_Minh'),
                'deleted_at' => null
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
        ], 200)->withCookie(
            cookie(
                'jwt-phutung',
                $token,
                15 * 24 * 60, // 15 days
                '/',
                null,
                false, // secure = false on localhost
                false, // httpOnly = false để JS đọc được cookie
                false,
                'Lax'  // sameSite = Lax để cho phép cross-domain trên localhost
            )
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
            // Get token from cookie or Authorization header
            $request = request();
            $token = $request->cookie('jwt-phutung');
            
            // If no cookie, try Authorization header
            if (!$token && $request->hasHeader('Authorization')) {
                $bearerToken = $request->header('Authorization');
                // Clean bearer token - fix the Bearer prefix removal
                $token = trim(str_replace('Bearer ', '', $bearerToken));
               
            }

            if (!$token) {
                Log::info('No token found in request');
                return response()->json([
                    'success' => false,
                    'message' => 'No token found'
                ], 401);
            }

            Log::info('Processing token: ' . substr($token, 0, 10) . '...');

            // Verify token
            try {
                $key = env('JWT_SECRET');
               
                
                $decoded = JWT::decode($token, new \Firebase\JWT\Key($key, 'HS256'));
                $userId = $decoded->userId;
               
            } catch (\Exception $e) {
              
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token: ' . $e->getMessage()
                ], 401);
            }

            // Get user with role
            $user = User::with('role')
                ->where('_id', $userId)
                ->where('deleted_at', null)
                ->first();

            if (!$user || !$user->role) {
               
                return response()->json([
                    'success' => false,
                    'message' => 'User not found or no role assigned'
                ], 401);
            }

            // Check if token needs refresh
            $timeUntilExpiry = $decoded->exp - time();
            $newToken = ($timeUntilExpiry < 24 * 60 * 60) 
                ? $this->generateTokenAndSetCookie($user->_id, $user->role->name)
                : $token;

           

            return response()->json([
                'success' => true,
                'message' => 'Authenticated',
                'user' => $user,
                'token' => $newToken
            ])->withCookie(
                cookie(
                    'jwt-phutung',
                    $newToken,
                    15 * 24 * 60,
                    '/',
                    null,
                    false,
                    false,
                    false,
                    'Lax'
                )
            );
        } catch (\Exception $e) {
            Log::error('Auth check failed with error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Authentication check failed: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generateTokenAndSetCookie($userId, $roleName)
    {
        $key = env('JWT_SECRET');

        if (empty($key)) {
            Log::error('JWT_SECRET is empty in .env file');
            throw new \Exception("JWT_SECRET không được để trống trong file .env");
        }

        if (!is_string($key)) {
            Log::error('JWT_SECRET must be a string, got: ' . gettype($key));
            throw new \Exception("JWT_SECRET phải là chuỗi");
        }

        $payload = [
            'userId' => (string)$userId,
            'role' => $roleName,
            'iat' => time(),
            'exp' => time() + (15 * 24 * 60 * 60) // 15 ngày
        ];

        try {
            $token = JWT::encode($payload, $key, 'HS256');
            Log::info('Token generated successfully');

            // Set cookie
            $cookie = cookie(
                'jwt-phutung',
                $token,
                15 * 24 * 60,
                '/',
                null,
                false,
                false,
                false,
                'Lax'
            );

            Cookie::queue($cookie);
            return $token;
        } catch (\Exception $e) {
            Log::error('Failed to generate token: ' . $e->getMessage());
            throw new \Exception("Không thể tạo token: " . $e->getMessage());
        }
    }
}
