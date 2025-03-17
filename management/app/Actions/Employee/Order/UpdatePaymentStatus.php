<?php

namespace App\Actions\Employee\Order;

use App\Models\Order;
use App\Http\Requests\Order\UpdatePaymentStatusRequest;
use App\Traits\Order\GeneratesOrderResponse;
use Illuminate\Http\JsonResponse;

class UpdatePaymentStatus
{
    use GeneratesOrderResponse;

    public function execute(UpdatePaymentStatusRequest $request, string $orderId): JsonResponse
    {
        try {
            $order = Order::findOrFail($orderId);
            $order->update(['payment_status' => $request->payment_status]);

            return $this->generateSuccessResponse($order, 'Cập nhật trạng thái thanh toán thành công');

        } catch (\Exception $e) {
            return $this->generateErrorResponse('Lỗi khi cập nhật trạng thái thanh toán: ' . $e->getMessage());
        }
    }
} 