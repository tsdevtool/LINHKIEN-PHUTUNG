<?php

namespace App\Actions\Customer\Cart;

use App\Http\Requests\Cart\GetCartRequest;
use App\Models\Cart;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class GetCart
{
    use ApiResponse;

    /**
     * Execute the action
     *
     * @param GetCartRequest $request
     * @return JsonResponse
     */
    public function execute(GetCartRequest $request): JsonResponse
    {
        try {
            $cart = Cart::with(['items.product'])
                ->where('user_id', Auth::id())
                ->where('status', 'pending')
                ->first();

            if (!$cart) {
                return $this->successResponse('Giỏ hàng trống', []);
            }

            return $this->successResponse('Lấy thông tin giỏ hàng thành công', $cart);
        } catch (\Exception $e) {
            return $this->errorResponse('Có lỗi xảy ra khi lấy thông tin giỏ hàng', $e);
        }
    }
} 