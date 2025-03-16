<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class DetailProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'id' => $this->route('id')
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'id' => 'required|string|exists:products,_id'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'id.required' => 'ID sản phẩm là bắt buộc',
            'id.string' => 'ID sản phẩm không hợp lệ',
            'id.exists' => 'Sản phẩm không tồn tại'
        ];
    }
} 