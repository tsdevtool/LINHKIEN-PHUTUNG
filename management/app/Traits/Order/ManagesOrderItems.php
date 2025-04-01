<?php

namespace App\Traits\Order;

use App\Models\CartItem;
use Illuminate\Support\Collection;

trait ManagesOrderItems
{
    protected function getCartItems(array $cartItemIds): Collection
    {
        $cartItems = CartItem::whereIn('_id', $cartItemIds)->get();
        
        if ($cartItems->isEmpty()) {
            throw new \Exception('Không tìm thấy sản phẩm trong giỏ hàng');
        }

        return $cartItems;
    }

    protected function calculateOrderItems(Collection $cartItems): array
    {
        $total = 0;
        $items = [];

        foreach ($cartItems as $cartItem) {
            $total += $cartItem->price * $cartItem->quantity;
            $items[] = [
                'product_id' => $cartItem->product_id,
                'quantity' => $cartItem->quantity,
                'price' => $cartItem->price
            ];
        }

        return [
            'total' => $total,
            'items' => $items
        ];
    }

    protected function removeCartItems(array $cartItemIds): void
    {
        CartItem::whereIn('_id', $cartItemIds)->delete();
    }
} 