<?php

namespace App\Http\Requests\Cart;

use App\Enums\CartStatus;

class GetCartRequest extends BaseCartRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'status' => 'required|string|in:' . implode(',', CartStatus::getValues())
        ];
    }
} 