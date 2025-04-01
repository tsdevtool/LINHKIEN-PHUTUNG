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
     * @param string $product_id
     * @return JsonResponse
     */
    public function execute(string $product_id): JsonResponse
    {
        try {
            $cart = Cart::where('user_id', Auth::id())
                ->where('status', 'pending')
                ->first();

            if (!$cart) {
                return $this->errorResponse('Không tìm thấy giỏ hàng');
            }

            // Xóa sản phẩm cụ thể khỏi giỏ hàng
            $deleted = $cart->items()->where('product_id', $product_id)->delete();

            if (!$deleted) {
                return $this->errorResponse('Không tìm thấy sản phẩm trong giỏ hàng');
            }

            // Nếu giỏ hàng không còn sản phẩm nào, xóa luôn giỏ hàng
            if ($cart->items()->count() === 0) {
                $cart->delete();
            }

            return $this->successResponse('Đã xóa sản phẩm khỏi giỏ hàng');
        } catch (\Exception $e) {
            return $this->errorResponse('Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng', $e);
        }
    }
} 