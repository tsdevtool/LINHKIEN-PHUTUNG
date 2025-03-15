<?php

namespace App\Http\Requests\Cart;

class UpdateCartItemQuantityRequest extends BaseCartRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'cart_item_id' => 'required|string|exists:cart_items,_id',
            'quantity' => 'required|integer|min:1'
        ];
    }
} 