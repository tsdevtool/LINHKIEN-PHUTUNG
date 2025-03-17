<?php

namespace App\Actions\Employee\Order;

use App\Models\Order;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Traits\Order\GeneratesOrderResponse;
use Illuminate\Http\JsonResponse;

class UpdateOrderStatus
{
    use GeneratesOrderResponse;

    public function execute(UpdateOrderStatusRequest $request, string $orderId): JsonResponse
    {
        try {
            $order = Order::findOrFail($orderId);
            $order->update(['status' => $request->status]);

            return $this->generateSuccessResponse($order, 'Cập nhật trạng thái đơn hàng thành công');

        } catch (\Exception $e) {
            return $this->generateErrorResponse('Lỗi khi cập nhật trạng thái đơn hàng: ' . $e->getMessage());
        }
    }
} 