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
        try {
            // First try bearer token, then cookie
            $token = $request->bearerToken();
            if (!$token) {
                $token = $request->cookie('jwt-phutung');
            }

            if (!$token) {
                return response()->json(['success' => false, 'message' => 'Unauthorized - No Token Provided'], 401);
            }

            $key = env('JWT_SECRET');
            if (!$key) {
                throw new \Exception('JWT_SECRET not configured');
            }

            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            
            // Get user with role relationship
            $user = User::with('role')->find($decoded->userId);
            if (!$user) {
                throw new \Exception('User not found');
            }

            if (!$user->role) {
                throw new \Exception('User role not found');
            }

            // Store role name in request
            $request->attributes->add(['user_role' => $decoded->role]);
            
            Auth::login($user);
            return $next($request);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - ' . $e->getMessage()
            ], 401);
        }
    }
}
