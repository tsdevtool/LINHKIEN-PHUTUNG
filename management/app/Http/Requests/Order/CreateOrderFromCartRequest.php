<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderFromCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cart_item_ids' => 'required|array',
            'cart_item_ids.*' => 'required|string',
            'recipient_name' => 'required|string',
            'recipient_phone' => 'required|string',
            'recipient_address' => 'required_if:order_method,delivery|string',
            'payment_type' => 'required|in:cash,payos',
            'order_method' => 'required|in:pickup,delivery',
            'discount' => 'nullable|numeric|min:0'
        ];
    }

    public function messages(): array
    {
        return [
            'cart_item_ids.required' => 'Vui lòng chọn sản phẩm',
            'recipient_name.required' => 'Vui lòng nhập tên người nhận',
            'recipient_phone.required' => 'Vui lòng nhập số điện thoại người nhận',
            'recipient_address.required_if' => 'Vui lòng nhập địa chỉ giao hàng',
            'payment_type.required' => 'Vui lòng chọn phương thức thanh toán',
            'order_method.required' => 'Vui lòng chọn phương thức nhận hàng'
        ];
    }
} 