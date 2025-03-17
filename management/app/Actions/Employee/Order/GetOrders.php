<?php

namespace App\Actions\Employee\Order;

use App\Models\Order;
use Illuminate\Http\JsonResponse;

class GetOrders
{
    public function execute(): JsonResponse
    {
        try {
            $orders = Order::with(['user', 'employee'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'orders' => $orders->map->generateInvoice()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }
} 