<?php

namespace App\Actions\Customer\Cart;

use App\Http\Requests\Cart\UpdateCartItemQuantityRequest;
use App\Models\Cart;
use App\Models\CartItem;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class UpdateCartItemQuantity
{
    use ApiResponse;

    /**
     * Execute the action
     *
     * @param UpdateCartItemQuantityRequest $request
     * @return JsonResponse
     */
    public function execute(UpdateCartItemQuantityRequest $request): JsonResponse
    {
        try {
            $cart = $this->findAndValidateCart();
            if (!$cart) {
                return $this->errorResponse('Không tìm thấy giỏ hàng');
            }

            $cartItem = $this->findAndValidateCartItem($cart, $request->cart_item_id);
            if (!$cartItem) {
                return $this->errorResponse('Không tìm thấy sản phẩm trong giỏ hàng');
            }

            if (!$this->validateProductQuantity($cartItem, $request->quantity)) {
                return $this->errorResponse('Số lượng sản phẩm không đủ');
            }

            $cartItem->quantity = $request->quantity;
            $cartItem->save();

            return $this->successResponse('Cập nhật số lượng thành công');
        } catch (\Exception $e) {
            return $this->errorResponse('Có lỗi xảy ra khi cập nhật số lượng', $e);
        }
    }

    /**
     * Find and validate cart
     *
     * @return Cart|null
     */
    private function findAndValidateCart(): ?Cart
    {
        return Cart::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->first();
    }

    /**
     * Find and validate cart item
     *
     * @param Cart $cart
     * @param string $cartItemId
     * @return CartItem|null
     */
    private function findAndValidateCartItem(Cart $cart, string $cartItemId): ?CartItem
    {
        return CartItem::where('cart_id', $cart->_id)
            ->where('_id', $cartItemId)
            ->with('product')
            ->first();
    }

    /**
     * Validate product quantity
     *
     * @param CartItem $cartItem
     * @param int $requestedQuantity
     * @return bool
     */
    private function validateProductQuantity(CartItem $cartItem, int $requestedQuantity): bool
    {
        return $cartItem->product->quantity >= $requestedQuantity;
    }
} 