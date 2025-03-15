<?php

namespace App\Actions\Customer\Cart;

use App\Models\Cart;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RemoveFromCart
{
    use ApiResponse;

    /**
     * Execute the action
     *
     * @return JsonResponse
     */
    public function execute(): JsonResponse
    {
        try {
            $cart = Cart::where('user_id', Auth::id())
                ->where('status', 'pending')
                ->first();

            if (!$cart) {
                return $this->errorResponse('Không tìm thấy giỏ hàng');
            }

            $cart->items()->delete();
            $cart->delete();

            return $this->successResponse('Xóa giỏ hàng thành công');
        } catch (\Exception $e) {
            return $this->errorResponse('Có lỗi xảy ra khi xóa giỏ hàng', $e);
        }
    }
} 