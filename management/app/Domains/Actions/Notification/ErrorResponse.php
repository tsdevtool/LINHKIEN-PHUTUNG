<?php

namespace App\Actions\Notification;

use Illuminate\Http\JsonResponse;

class ErrorResponse
{
    public function execute(string $message, int $status): JsonResponse
    {
        return response()->json([
            'status' => $status,
            'message' => $message
        ], $status);
    }
}
