<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken() ?? $request->cookie('jwt-phutung');

    if (!$token) {
        return response()->json(['success' => false, 'message' => 'Unauthorized - No Token Provided'], 401);
    }

    try {
        $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
        $user = User::find($decoded->userId);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User Not Found'], 401);
        }

        Auth::login($user);
        return $next($request);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Unauthorized - Invalid Token'], 401);
    }
    }
}
