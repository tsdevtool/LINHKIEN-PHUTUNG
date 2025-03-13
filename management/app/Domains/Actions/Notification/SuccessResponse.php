<?php

namespace App\Actions\Notification;

use Illuminate\Http\JsonResponse;

class SuccessResponse
{
    public function execute($result = null, $message, $status = 200): JsonResponse{
        return response()->json([
            'status' => $status,
            'message' => $message,
            'data' => $result
        ], $status);
    }
}