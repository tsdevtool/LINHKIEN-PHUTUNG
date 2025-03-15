<?php

namespace App\Http\Requests\Cart;

class AddToCartRequest extends BaseCartRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'product_id' => 'required|string|exists:products,_id',
            'quantity' => 'required|integer|min:1'
        ];
    }
} 