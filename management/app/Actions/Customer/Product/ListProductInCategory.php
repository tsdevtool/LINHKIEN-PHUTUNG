<?php

namespace App\Actions\Customer\Product;

use App\Http\Requests\Product\ListProductInCategoryRequest;
use App\Models\Product;
use App\Models\Category;
use App\Traits\ApiResponse;
use App\Traits\CategoryTrait;
use Illuminate\Http\JsonResponse;

class ListProductInCategory
{
    use ApiResponse;
    use CategoryTrait;

    public function execute(ListProductInCategoryRequest $request): JsonResponse
    {
        try {
            $category = $this->checkCategoryIsExist($request->category_id);
            if (!$category) {
                return $this->errorResponse('Danh mục không tồn tại', 404);
            }

            if (!$category->is_active) {
                return $this->errorResponse('Danh mục không khả dụng', 400);
            }

            $childCategories = Category::where('parent_id', $category->_id)
                ->active()
                ->orderBy('order', 'asc')
                ->get(['_id', 'name']);

            $categoryIds = array_merge(
                [$category->_id],
                $childCategories->pluck('_id')->toArray()
            );

            // Lấy các tham số từ request
            $perPage = $request->getPerPage();
            $sortParams = $request->getSortParams();
            $search = $request->getSearchQuery();

            // Query sản phẩm với phân trang
            $query = Product::whereIn('category_id', $categoryIds)->active();

            // Thêm tìm kiếm theo tên nếu có
            if (!empty($search)) {
                $query->where('name', 'like', '%' . $search . '%');
            }

            // Sắp xếp theo tham số
            $query->orderBy($sortParams['sort_by'], $sortParams['sort_direction']);

            // Phân trang
            $products = $query->paginate($perPage);

            // Format response khi không có sản phẩm
            if ($products->isEmpty()) {
                return $this->successResponse(
                    [
                        'category' => [
                            'id' => $category->_id,
                            'name' => $category->name,
                            'level' => $category->level,
                            'child_categories' => $childCategories
                        ],
                        'current_page' => 1,
                        'data' => [],
                        'first_page_url' => null,
                        'from' => null,
                        'last_page' => 1,
                        'last_page_url' => null,
                        'next_page_url' => null,
                        'per_page' => $perPage,
                        'prev_page_url' => null,
                        'to' => null,
                        'total' => 0,
                        'filters' => [
                            'sort_by' => $sortParams['sort_by'],
                            'sort_direction' => $sortParams['sort_direction'],
                            'search' => $search
                        ]
                    ],
                    'Không có sản phẩm nào trong danh mục này'
                );
            }

            // Format response khi có sản phẩm
            return $this->successResponse(
                [
                    'category' => [
                        'id' => $category->_id,
                        'name' => $category->name,
                        'level' => $category->level,
                        'child_categories' => $childCategories
                    ],
                    'current_page' => $products->currentPage(),
                    'data' => $products->items(),
                    'first_page_url' => $products->url(1),
                    'from' => $products->firstItem(),
                    'last_page' => $products->lastPage(),
                    'last_page_url' => $products->url($products->lastPage()),
                    'next_page_url' => $products->nextPageUrl(),
                    'per_page' => $products->perPage(),
                    'prev_page_url' => $products->previousPageUrl(),
                    'to' => $products->lastItem(),
                    'total' => $products->total(),
                    'filters' => [
                        'sort_by' => $sortParams['sort_by'],
                        'sort_direction' => $sortParams['sort_direction'],
                        'search' => $search
                    ]
                ],
                'Lấy danh sách sản phẩm theo danh mục thành công'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Có lỗi xảy ra khi lấy danh sách sản phẩm: ' . $e->getMessage(), 500);
        }
    }
}