<?php

namespace App\Actions\Customer\Order;

use App\Models\Order;
use App\Traits\Order\GeneratesOrderResponse;
use Illuminate\Http\JsonResponse;

class CancelOrder
{
    use GeneratesOrderResponse;

    public function execute(string $id): JsonResponse
    {
        try {
            $order = Order::findOrFail($id);

            if (!$order->canCancel()) {
                return $this->generateErrorResponse('Không thể hủy đơn hàng này', 400);
            }

            if ($order->cancel()) {
                return $this->generateSuccessResponse($order, 'Hủy đơn hàng thành công');
            }

            return $this->generateErrorResponse('Không thể hủy đơn hàng', 500);

        } catch (\Exception $e) {
            return $this->generateErrorResponse('Lỗi khi hủy đơn hàng: ' . $e->getMessage());
        }
    }
} 