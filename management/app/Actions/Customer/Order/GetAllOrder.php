<?php

namespace App\Actions\Customer\Order;

use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GetAllOrder
{
    use ApiResponse;

    /**
     * Execute the action to get all orders for the current user
     *
     * @return JsonResponse
     */
    public function execute(): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return $this->errorResponse('Người dùng chưa đăng nhập', 401);
            }

            $orders = Order::where('customer_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();

            if ($orders->isEmpty()) {
                return $this->successResponse([], 'Bạn chưa có đơn hàng nào');
            }

            // Transform orders data to provide necessary information
            $formattedOrders = $orders->map(function ($order) {
                return [
                    'id' => $order->_id,
                    'order_number' => $order->order_number,
                    'created_at' => $order->created_at->format('d/m/Y H:i'),
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'payment_type' => $order->payment_method,
                    'total' => $order->total_amount,
                    'final_total' => $order->finaltotal,
                    'items_count' => count($order->items)
                ];
            });

            return $this->successResponse($formattedOrders, 'Lấy danh sách đơn hàng thành công');
        } catch (\Exception $e) {
            return $this->errorResponse('Lỗi khi lấy danh sách đơn hàng: ' . $e->getMessage());
        }
    }
}
