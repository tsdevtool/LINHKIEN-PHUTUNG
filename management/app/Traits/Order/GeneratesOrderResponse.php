<?php

namespace App\Traits\Order;

use App\Models\Order;
use App\Enums\PaymentType;
use Illuminate\Http\JsonResponse;

trait GeneratesOrderResponse
{
    protected function generateSuccessResponse(Order $order, string $message = 'Thành công'): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'order' => $order->generateInvoice()
        ];

        if ($order->payment_type === PaymentType::BANK_TRANSFER) {
            $response['qr_code'] = $order->generateQRCode();
        }

        return response()->json($response, 201);
    }

    protected function generateErrorResponse(string $message, int $statusCode = 500): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], $statusCode);
    }
} 