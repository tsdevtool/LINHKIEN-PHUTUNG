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
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'category_id' => $this->route('category_id')
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'category_id' => 'required|string|exists:categories,_id',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
            'sort_by' => 'nullable|string|in:created_at,price,name,quantity',
            'sort_direction' => 'nullable|string|in:asc,desc',
            'search' => 'nullable|string|max:100'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'ID danh mục là bắt buộc',
            'category_id.string' => 'ID danh mục không hợp lệ',
            'category_id.exists' => 'Danh mục không tồn tại',
            'page.integer' => 'Số trang phải là số nguyên',
            'page.min' => 'Số trang phải lớn hơn 0',
            'per_page.integer' => 'Số sản phẩm trên trang phải là số nguyên',
            'per_page.min' => 'Số sản phẩm trên trang phải lớn hơn 0',
            'per_page.max' => 'Số sản phẩm trên trang không được vượt quá 50',
            'sort_by.in' => 'Trường sắp xếp không hợp lệ',
            'sort_direction.in' => 'Hướng sắp xếp không hợp lệ',
            'search.max' => 'Từ khóa tìm kiếm không được vượt quá 100 ký tự'
        ];
    }

    /**
     * Get the per page value.
     */
    public function getPerPage(): int
    {
        return $this->input('per_page', 10);
    }

    /**
     * Get the sort parameters.
     */
    public function getSortParams(): array
    {
        return [
            'sort_by' => $this->input('sort_by', 'created_at'),
            'sort_direction' => $this->input('sort_direction', 'desc')
        ];
    }

    /**
     * Get the search query.
     */
    public function getSearchQuery(): ?string
    {
        return $this->input('search');
    }
}
