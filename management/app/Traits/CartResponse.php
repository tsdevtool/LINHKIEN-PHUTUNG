<?php

namespace App\Traits;

use App\Models\Cart;
use Illuminate\Http\JsonResponse;

trait CartResponse
{
    /**
     * Format cart response with user data
     */
    protected function formatCartResponse(Cart $cart, string $message): array
    {
        $cart->load('items.product');
        $cart->status_label = $cart->getStatusLabel();

        return [
            'cart' => $cart,
            'user' => [
                'id' => $cart->user->_id,
                'name' => $cart->user->name,
                'email' => $cart->user->email
            ]
        ];
    }

    /**
     * Return cart not found response
     */
    protected function cartNotFoundResponse(): JsonResponse
    {
        return $this->errorResponse('Không tìm thấy giỏ hàng', 404);
    }

    /**
     * Return insufficient stock response
     */
    protected function insufficientStockResponse(): JsonResponse
    {
        return $this->errorResponse('Số lượng sản phẩm trong kho không đủ', 400);
    }

    /**
     * Return product not found response
     */
    protected function productNotFoundResponse(): JsonResponse
    {
        return $this->errorResponse('Không tìm thấy sản phẩm', 404);
    }
} 