<?php

namespace App\Http\Requests\Order;

class CreateEmployeeOrderFromCartRequest extends CreateOrderFromCartRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'user_id' => 'required|string'
        ]);
    }

    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'user_id.required' => 'Vui lòng chọn khách hàng'
        ]);
    }
} 