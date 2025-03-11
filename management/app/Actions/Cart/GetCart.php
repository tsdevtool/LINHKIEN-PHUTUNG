<?php

namespace App\Actions\Cart;


use App\Actions\Notification\ErrorResponse;
use App\Actions\Notification\SuccessResponse;
use App\Models\Cart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class GetCart
{
    private $errorResponse, $successResponse;

    public function __construct(ErrorResponse $errorResponse, SuccessResponse $successResponse)
    {
        $this->errorResponse = $errorResponse;
        $this->successResponse = $successResponse;
    }
    public function execute(Request $request): JsonResponse
    {
    try {
        $user = Auth::user();
        if (!$user) {
            return $this->errorResponse->execute('Yêu cầu người dùng đăng nhập', 401);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:' . implode(',', [
                Cart::STATUS_PENDING,
                Cart::STATUS_CHECKOUT, 
                Cart::STATUS_COMPLETED,
                Cart::STATUS_CANCELED
            ])
        ]);
        
        if ($validator->fails()) {
            return $this->errorResponse->execute('Trạng thái giỏ hàng không hợp lệ', 422);
        }

        $cart = $this->getCartByStatus($user->_id, $request->status);

        if(!$cart){
            return $this->successResponse->execute(null, 'Không tìm thấy giỏ hàng', 404);
        }

        return $this->successResponse->execute($cart, 'Lấy thông tin giỏ hàng thành công');
        
    } catch (\Exception $e) {
        return $this->errorResponse->execute('Lỗi khi lấy thông tin giỏ hàng: ' . $e->getMessage(), 500);
    }
    }

    private function getCartByStatus(string $userId, string $status)
    {
        return Cart::with(['items.product'])
            ->where('user_id', $userId)
            ->where('status', $status)
            ->first();
    }
}