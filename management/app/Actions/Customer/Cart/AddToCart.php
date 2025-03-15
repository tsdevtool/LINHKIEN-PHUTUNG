<?php

namespace App\Actions\Customer\Cart;

use App\Http\Requests\Cart\AddToCartRequest;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AddToCart
{
    use ApiResponse;

    /**
     * Execute the action
     *
     * @param AddToCartRequest $request
     * @return JsonResponse
     */
    public function execute(AddToCartRequest $request): JsonResponse
    {
        try {
            $product = Product::findOrFail($request->product_id);
            
            if ($product->quantity < $request->quantity) {
                return $this->errorResponse('Số lượng sản phẩm không đủ');
            }

            $cart = Cart::firstOrCreate(
                [
                    'user_id' => Auth::id(),
                    'status' => 'pending'
                ]
            );

            $cartItem = CartItem::where('cart_id', $cart->_id)
                ->where('product_id', $product->_id)
                ->first();

            if ($cartItem) {
                $cartItem->quantity += $request->quantity;
                $cartItem->save();
            } else {
                CartItem::create([
                    'cart_id' => $cart->_id,
                    'product_id' => $product->_id,
                    'quantity' => $request->quantity
                ]);
            }

            return $this->successResponse('Thêm vào giỏ hàng thành công');
        } catch (\Exception $e) {
            return $this->errorResponse('Có lỗi xảy ra khi thêm vào giỏ hàng', $e);
        }
    }
} 