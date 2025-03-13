<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
            ]);
    
            $token = $this->generateTokenAndSetCookie($user->id);
    
            return response()->json(['success' => true, 'user' => $user, 'token' => $token], 201);
        
        } catch (\Throwable $th) {
            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Lỗi server: ' . $th->getMessage() ], 500);
            }
        }
    }

    public function login(Request $request)
    {
        $credentials = $request->only('phone', 'password');

        $user = User::where('phone', $credentials['phone'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['success' => false, 'message' => 'Sai số điện thoại hoặc mật khẩu'], 400);
        }

        $token = $this->generateTokenAndSetCookie($user->id);

        return response()->json(['success' => true, 'user' => $user, 'token' => $token])->withCookie(cookie('jwt-phutung', $token, 60, '/', null, false, true));
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
        return response()->json(['message' => true, 'user' => Auth::user()]);
    }

    private function generateTokenAndSetCookie($userId)
{
    $key = env('JWT_SECRET');

    if (!$key || !is_string($key)) {
        throw new \Exception("JWT_SECRET không hợp lệ hoặc không phải là chuỗi.");
    }

    $payload = [
        'userId' => $userId,
        'iat' => time(),
        'exp' => time() + (15 * 24 * 60 * 60) // 15 ngày
    ];

    $token = JWT::encode($payload, $key, 'HS256');

    // Đặt cookie
    Cookie::queue(Cookie::make('jwt-phutung', $token, 15 * 24 * 60 * 60, '/', null, false, true, false, 'Lax'));

    return $token;
}
}
