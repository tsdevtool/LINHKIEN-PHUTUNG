<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class ListProductInCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => 'required|string|exists:categories,_id'
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'ID danh mục là bắt buộc',
            'category_id.string' => 'ID danh mục không hợp lệ',
            'category_id.exists' => 'Danh mục không tồn tại'
        ];
    }
}
