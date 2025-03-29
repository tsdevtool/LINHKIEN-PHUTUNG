<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        try {
            $userRole = strtolower($request->attributes->get('user_role'));
            if (!$userRole) {
                throw new \Exception('User role not found in request');
            }

            // Convert all roles to lowercase for comparison
            $roles = array_map('strtolower', $roles);
            
            if (!in_array($userRole, $roles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền truy cập chức năng này'
                ], 403);
            }

            return $next($request);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Role check failed - ' . $e->getMessage()
            ], 403);
        }
    }
} 