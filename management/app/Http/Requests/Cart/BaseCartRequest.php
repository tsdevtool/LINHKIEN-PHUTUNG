<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

abstract class BaseCartRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Common validation messages
     */
    protected function getCommonMessages(): array
    {
        return [
            'required' => ':attribute là bắt buộc',
            'string' => ':attribute phải là chuỗi',
            'integer' => ':attribute phải là số nguyên',
            'min' => ':attribute phải lớn hơn hoặc bằng :min',
            'exists' => ':attribute không tồn tại',
            'in' => ':attribute không hợp lệ'
        ];
    }

    /**
     * Common attribute names
     */
    protected function getCommonAttributes(): array
    {
        return [
            'product_id' => 'Sản phẩm',
            'cart_item_id' => 'Sản phẩm trong giỏ hàng',
            'quantity' => 'Số lượng',
            'status' => 'Trạng thái'
        ];
    }

    /**
     * Get the validation messages
     */
    public function messages(): array
    {
        return array_merge(
            $this->getCommonMessages(),
            $this->getCustomMessages()
        );
    }

    /**
     * Get the custom validation messages
     */
    protected function getCustomMessages(): array
    {
        return [];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return array_merge(
            $this->getCommonAttributes(),
            $this->getCustomAttributes()
        );
    }

    /**
     * Get the custom attributes
     */
    protected function getCustomAttributes(): array
    {
        return [];
    }
} 