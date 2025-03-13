<?php

namespace App\Actions\Cart;

use App\Actions\Notification\ErrorResponse;
use App\Actions\Notification\SuccessResponse;

use App\Models\Cart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class RemoveFromCart
{
    private $errorResponse, $successResponse;

    public function __construct(ErrorResponse $errorResponse, SuccessResponse $successResponse)
    {
        $this->errorResponse = $errorResponse;
        $this->successResponse = $successResponse;
    }

    public function execute(): JsonResponse
    {
        try {
            $user = Auth::user();

            $cart = Cart::where('user_id', $user->_id)
                       ->where('status', Cart::STATUS_PENDING)
                       ->first();

            if (!$cart) {
                return $this->errorResponse->execute('Không tìm thấy giỏ hàng', 404);
            }

            $cart->items()->delete();

            $cart->delete();

            return $this->successResponse->execute('Đã xóa giỏ hàng thành công',200);
        } catch (\Exception $e) {
            return $this->errorResponse->execute('Lỗi xóa sản phẩm khỏi giỏ hàng: ' . $e->getMessage(), 500);
        }
    }
}